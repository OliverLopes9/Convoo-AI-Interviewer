/**
 * Interview flow using MongoDB. 10 questions, difficulty, user profile.
 */

import { Interview, IInterview } from '../models/Interview';
import { User, IUser } from '../models/User';
import {
  getFirstQuestion,
  getTotalQuestions,
  evaluateInterview,
  getSystemPrompt,
  generateConversationalResponse,
  type ChatMessage,
  type UserProfile,
  type Difficulty,
  type EvaluationResult,
} from './geminiService';

const TOTAL = 10;

export type StartResult = {
  interviewId: string;
  reply?: string;
  question: string;
  spokenText: string;
  questionNumber: number;
  totalQuestions: number;
};

export type AnswerResult = {
  reply?: string;
  question: string;
  spokenText: string;
  questionNumber: number;
  totalQuestions: number;
  isComplete: boolean;
  isRepeat: boolean;
  scores?: EvaluationResult;
  interviewId: string;
};

const STAGES: Array<'intro' | 'experience' | 'project' | 'skills' | 'technical' | 'advanced' | 'closing'> =
  ['intro', 'experience', 'project', 'skills', 'technical', 'advanced', 'closing'];

function getStageForTime(elapsedSeconds: number, totalDuration: number): typeof STAGES[number] {
  const percent = (elapsedSeconds / totalDuration) * 100;
  if (percent < 15) return 'intro';
  if (percent < 35) return 'experience';
  if (percent < 55) return 'project';
  if (percent < 75) return 'skills';
  if (percent < 90) return 'technical';
  if (percent < 97) return 'advanced';
  return 'closing';
}

function toProfile(user: IUser): UserProfile {
  return {
    name: user.name,
    education: user.education,
    experience: user.experience,
    skills: user.skills,
    pastProjects: user.pastProjects,
    targetRole: user.targetRole,
  };
}

function buildProfileMessage(profile: UserProfile, difficulty: Difficulty): string {
  return `Candidate profile:
Education: ${profile.education ?? ''}
Experience: ${profile.experience ?? ''}
Skills: ${profile.skills ?? ''}
Projects: ${profile.pastProjects ?? ''}
Target role: ${profile.targetRole ?? ''}
Difficulty: ${difficulty}`;
}

export async function startInterview(userId: string, difficulty: Difficulty): Promise<StartResult> {
  const user = await User.findById(userId).orFail(new Error('User not found'));
  const profile = toProfile(user);
  const first = getFirstQuestion();

  const systemPrompt = getSystemPrompt(profile, difficulty, 'intro');
  const profileUserMessage = buildProfileMessage(profile, difficulty);

  const interview = await Interview.create({
    userId,
    difficulty,
    questions: [first],
    answers: [],
    status: 'in_progress',
    currentStage: 'intro',
    messages: [
      { role: 'system', content: systemPrompt, timestamp: new Date() },
      { role: 'user', content: profileUserMessage, timestamp: new Date() },
      { role: 'model', content: first, timestamp: new Date() },
    ],
    startTime: new Date(),
    durationSeconds: 120,
  });

  return {
    interviewId: interview._id.toString(),
    question: first,
    spokenText: first,
    questionNumber: 1,
    totalQuestions: getTotalQuestions(),
  };
}

export async function submitAnswer(
  interviewId: string,
  userId: string,
  transcript: string
): Promise<AnswerResult> {
  const interview = await Interview.findOne({ _id: interviewId, userId }).orFail(
    new Error('Interview not found')
  );

  if (interview.status === 'completed') {
    throw new Error('Interview already completed');
  }

  // Update history
  const cleanedAnswer = (transcript ?? '').trim();
  interview.messages.push({ role: 'user', content: cleanedAnswer || '(No answer)', timestamp: new Date() });
  interview.answers.push(cleanedAnswer);

  // Check time limit
  const startTime = interview.startTime ? new Date(interview.startTime).getTime() : Date.now();
  const now = Date.now();
  const elapsedSeconds = (now - startTime) / 1000;
  const duration = interview.durationSeconds || 120;

  const isTimeUp = elapsedSeconds >= duration;
  const currentStage = getStageForTime(elapsedSeconds, duration);
  interview.currentStage = currentStage;

  if (isTimeUp || currentStage === 'closing') {
    const user = await User.findById(userId).orFail(new Error('User not found'));
    const profile = toProfile(user);

    const qaPairs = interview.questions.map((q, i) => ({
      question: q,
      answer: interview.answers[i] ?? '',
    }));

    const evaluation = await evaluateInterview({
      difficulty: interview.difficulty,
      userProfile: profile,
      qaPairs,
    });

    const toTen = (n: number) => Math.min(10, Math.max(1, Math.round(n / 10)));
    interview.scores = {
      overall: toTen(evaluation.overallScore),
      relevance: toTen(evaluation.relevance),
      fluency: toTen(evaluation.fluency),
      confidence: toTen(evaluation.confidence),
    };
    interview.feedback = evaluation.finalFeedback;
    interview.strengths = evaluation.strengths;
    interview.improvements = evaluation.improvements;
    interview.finalFeedback = evaluation.finalFeedback;
    interview.status = 'completed';
    await interview.save();

    const closingMsg = isTimeUp ? "Thank you for your time. The interview is now complete." : "That covers everything I wanted to ask. Thank you for the insightful conversation!";

    return {
      question: closingMsg,
      spokenText: closingMsg,
      questionNumber: interview.questions.length,
      totalQuestions: TOTAL,
      isComplete: true,
      isRepeat: false,
      scores: evaluation,
      interviewId,
    };
  }

  // Generate next question
  const user = await User.findById(userId).orFail(new Error('User not found'));
  const profile = toProfile(user);

  let result: { reply: string; question: string };
  try {
    result = await generateConversationalResponse(
      interview.messages as ChatMessage[],
      interview.difficulty,
      profile,
      currentStage
    );
  } catch (err) {
    console.error('[interviewService] AI failed, using fallback:', err);
    result = {
      reply: "I see.",
      question: 'Can you tell me more about your recent projects and the biggest challenge you overcame?'
    };
  }

  const spokenText = result.reply ? `${result.reply} ${result.question}` : result.question;
  interview.messages.push({ role: 'model', content: spokenText, timestamp: new Date() });
  interview.questions.push(result.question);
  await interview.save();

  return {
    reply: result.reply,
    question: result.question,
    spokenText,
    questionNumber: interview.questions.length,
    totalQuestions: TOTAL,
    isComplete: false,
    isRepeat: false,
    interviewId,
  };
}

export async function getInterviewHistory(userId: string): Promise<IInterview[]> {
  return await Interview.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
}

export async function getInterviewById(interviewId: string, userId: string): Promise<IInterview | null> {
  return await Interview.findOne({ _id: interviewId, userId }).lean();
}
