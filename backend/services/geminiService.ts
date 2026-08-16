/**
 * AI service for dynamic interview questions and evaluation.
 * Now backed by OpenRouter chat completions instead of direct Gemini calls.
 */

import axios from 'axios';

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY || API_KEY === 'your_openrouter_api_key_here') {
  console.warn('[geminiService] WARNING: OPENROUTER_API_KEY is missing or invalid.');
}
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const TOTAL_QUESTIONS = 10;
const FIRST_QUESTION = 'Hello, could you briefly introduce yourself and your background?';
const REPROMPT = 'Could you elaborate a bit more on that?';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export type UserProfile = {
  name?: string;
  education?: string;
  experience?: string;
  skills?: string;
  pastProjects?: string;
  targetRole?: string;
};

export type EvaluationResult = {
  overallScore: number;
  relevance: number;
  fluency: number;
  confidence: number;
  strengths: string;
  improvements: string;
  finalFeedback: string;
};

export type QAPair = { question: string; answer: string };

export type ChatMessage = {
  role: 'system' | 'user' | 'model';
  content: string;
};

export type GenerateNextQuestionInput = {
  difficulty: Difficulty;
  userProfile: UserProfile;
  userEmail?: string;
  previousAnswer: string;
  questionNumber: number;
  previousQuestions: string[];
};

export function isValidAnswer(text: string | null | undefined): boolean {
  const t = (text ?? '').trim();
  if (t.length < 3) return false;
  const lower = t.toLowerCase();
  const invalid = ['no', 'nothing', 'skip', 'idk', "don't know", 'dont know', 'nope', 'nah'];
  if (invalid.some((x) => lower === x || lower.startsWith(x + ' ') || lower.endsWith(' ' + x))) return false;
  return true;
}

export function getRepromptMessage(): string {
  return REPROMPT;
}

export function getFirstQuestion(): string {
  return FIRST_QUESTION;
}

export function getTotalQuestions(): number {
  return TOTAL_QUESTIONS;
}

const FALLBACK_QUESTIONS: string[] = [
  'Tell me about your project.',
  'What did you learn from that?',
  'What tools did you use?',
  'What challenges did you face?',
  'What was your role?',
  'How would you improve it?',
  'Explain your internship work.',
];

function getRandomFallback(): string {
  return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
}

export function getSystemPrompt(userProfile: UserProfile, difficulty: Difficulty, stage: string = 'intro'): string {
  const profileBlock = [
    userProfile.pastProjects && `Projects: ${userProfile.pastProjects}`,
    userProfile.experience && `Experience: ${userProfile.experience}`,
    userProfile.skills && `Skills: ${userProfile.skills}`,
    userProfile.education && `Education: ${userProfile.education}`,
    userProfile.targetRole && `Target Role: ${userProfile.targetRole}`,
  ].filter(Boolean).join('\n');

  const stageGoals: Record<string, string> = {
    intro: "Goal: Introduce yourself and set the stage. Ask about the candidate's background.",
    experience: "Goal: Deep dive into their work history and impact at previous companies.",
    project: "Goal: Discuss a specific project or challenge they handled.",
    skills: "Goal: Verify technical skills listed in their profile with targeted questions.",
    technical: "Goal: Ask problem-solving or scenario-based technical questions.",
    advanced: "Goal: High-level architectural or deep conceptual questions.",
    closing: "Goal: Wrap up the interview professionally."
  };

  const difficultyGuide =
    difficulty === 'beginner' ? 'Beginner: ask simple, foundational questions.'
      : difficulty === 'intermediate' ? 'Intermediate: ask applied, technical questions.'
        : 'Expert: ask deep technical questions requiring detailed reasoning.';

  return `You are a professional technical interviewer conducting a realistic job interview.

CURRENT STAGE: ${stage}
STAGE GOAL: ${stageGoals[stage] || stageGoals.intro}

GENERAL RULES:
1. Always remember previous questions and answers.
2. YOU MUST REACT to the candidate's last answer before asking the next question.
3. Be supportive but professional.
4. Ask one clear question at a time.
5. Never repeat the same question.
6. Maintain natural interview flow.
7. Keep the total output concise.

DIFFICULTY: ${difficultyGuide}

CANDIDATE PROFILE:
${profileBlock || '(No profile provided)'}

OUTPUT RULES:
You MUST respond with a valid JSON object ONLY. NEVER return plain text.
Format:
{
  "reply": "Short professional reaction.",
  "question": "Next interview question."
}`;
}

type AIConversationalResponse = {
  reply: string;
  question: string;
};

/**
 * Robustly parse AI response, supporting plain text fallbacks.
 */
function parseAIResponse(raw: string): AIConversationalResponse | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Try parsing JSON first
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        reply: String(parsed.reply || '').trim(),
        question: String(parsed.question || parsed.reply || '').trim()
      };
    }
  } catch (e) {
    console.warn('[geminiService] JSON parse failed, falling back to text parsing');
  }

  // If not JSON, treat whole thing as a question if it looks like one
  if (trimmed.length > 5) {
    return {
      reply: "",
      question: trimmed
    };
  }

  return null;
}

/**
 * Strict validation of the AI's question content.
 */
function isQuestionValid(text: string, previousQuestions: string[]): boolean {
  const t = text.trim();

  // Basic length check - relaxed as per user request (> 3)
  if (!t || t.length <= 3) return false;

  // Fragment rejection
  const fragments = ['Could', ')', 'I learned', 'Tell me', 'Explain', 'What'];
  if (fragments.includes(t)) return false;
  if (t === ')' || t.endsWith(')')) {
    if (t.split(' ').length < 3) return false;
  }

  // Memory guard: check for repeats
  const lower = t.toLowerCase();
  const isRepeat = previousQuestions.some(pq => {
    const pqLower = pq.toLowerCase().trim();
    return pqLower === lower || pqLower.includes(lower) || lower.includes(pqLower);
  });
  if (isRepeat) return false;

  return true;
}

// The original isAskingForClarification function is no longer used with the new prompt structure.
// function isAskingForClarification(userAnswer: string): boolean {
//   const t = userAnswer.toLowerCase();
//   const markers = ['what?', 'what do you mean', 'explain', 'what role', 'what project', 'confused'];
//   return markers.some(m => t.includes(m));
// }

function getSmartFallback(profile: UserProfile, stage: string): AIConversationalResponse {
  let reply = "I see.";
  let question = getRandomFallback();

  if (stage === 'experience' && profile.experience) {
    reply = "That's helpful background on your experience.";
    question = `Could you tell me more about your responsibilities during your time at ${profile.experience.split(',')[0]}?`;
  } else if (stage === 'project' && profile.pastProjects) {
    reply = "Interesting project.";
    question = `What was the most difficult part of working on ${profile.pastProjects.split(',')[0]}?`;
  } else if (stage === 'skills' && profile.skills) {
    reply = "Understood.";
    question = `Can you describe a situation where you had to use your ${profile.skills.split(',')[0]} skills to solve a problem?`;
  }

  return { reply, question };
}

export async function generateConversationalResponse(
  history: ChatMessage[],
  difficulty: Difficulty,
  userProfile?: UserProfile,
  stage: string = 'intro'
): Promise<AIConversationalResponse> {
  const profile = userProfile ?? {};
  const previousQuestions = history.filter(m => m.role === 'model').map(m => m.content);
  const systemPrompt = getSystemPrompt(profile, difficulty, stage);

  const openRouterMessages = history.map((m) => ({
    role: m.role === 'model' ? 'assistant' : m.role,
    content: m.content,
  }));

  if (!openRouterMessages.some((m) => m.role === 'system')) {
    openRouterMessages.unshift({ role: 'system', content: systemPrompt });
  }

  // Retry logic: try once, then fallback
  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: 'openrouter/auto',
          messages: openRouterMessages,
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15s timeout
        }
      );

      const rawContent: string = (response.data?.choices?.[0]?.message?.content as string | undefined) ?? '';

      const parsed = parseAIResponse(rawContent);

      if (parsed && isQuestionValid(parsed.question, previousQuestions)) {
        return parsed;
      }
      console.warn(`[geminiService] Attempt ${attempts} invalid, text was:`, rawContent);
    } catch (err) {
      console.error(`[geminiService] Attempt ${attempts} failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.warn('[geminiService] All attempts failed or invalid. Using smart fallback.');
  return getSmartFallback(profile, stage);
}

export type EvaluateInput = {
  difficulty: Difficulty;
  userProfile: UserProfile;
  qaPairs: QAPair[];
};

export async function evaluateInterview(input: EvaluateInput): Promise<EvaluationResult> {
  const { difficulty, userProfile, qaPairs } = input;
  console.log('[geminiService] evaluateInterview', { difficulty, qaCount: qaPairs.length });

  const profileBlock = [
    userProfile.education && `Education: ${userProfile.education}`,
    userProfile.experience && `Experience: ${userProfile.experience}`,
    userProfile.skills && `Skills: ${userProfile.skills}`,
    userProfile.pastProjects && `Projects: ${userProfile.pastProjects}`,
    userProfile.targetRole && `Target Role: ${userProfile.targetRole}`,
  ].filter(Boolean).join('\n');

  const qaBlock = qaPairs
    .map((qa, i) => `Question ${i + 1}: ${qa.question}\nAnswer ${i + 1}: ${qa.answer}`)
    .join('\n\n');

  const prompt = `You are a professional and strict interview evaluator.
Evaluate the candidate based on the FULL interview history provided below.

DIFFICULTY: ${difficulty}

CANDIDATE PROFILE:
${profileBlock || '(No profile provided)'}

INTERVIEW Q&A:
${qaBlock}

EVALUATION RULES:
1. Score strictly based on the actual answers provided.
2. The overallScore must be between 0 and 100.
3. relevance, fluency, and confidence must be between 0 and 10.
4. Scores MUST NOT be constant and must reflect the quality of the specific answers.
5. Provide constructive feedback, highlighting specific strengths and areas for improvement.

Return ONLY valid JSON. NEVER include any text outside the JSON object.
JSON Format:
{
  "overallScore": number,
  "relevance": number,
  "fluency": number,
  "confidence": number,
  "strengths": "string describing strengths",
  "improvements": "string describing areas for improvement",
  "feedback": "overall professional feedback"
}
`;

  if (!API_KEY) {
    console.warn('[geminiService] No API Key for evaluation. Using dynamic fallback.');
    return getDynamicFallback(qaPairs);
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: 'You are an interview evaluator. Respond ONLY with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://convoo.ai',
          'X-Title': 'Convoo Interview Engine',
        },
        timeout: 25000,
      }
    );

    const raw: string = (response.data?.choices?.[0]?.message?.content as string | undefined) ?? '';

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error('[geminiService] No JSON found in response');
      return getDynamicFallback(qaPairs);
    }

    const jsonStr = raw.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);

    return {
      overallScore: normalizeScore(parsed.overallScore, 100),
      relevance: normalizeScore(parsed.relevance, 10),
      fluency: normalizeScore(parsed.fluency, 10),
      confidence: normalizeScore(parsed.confidence, 10),
      strengths: String(parsed.strengths || 'N/A'),
      improvements: String(parsed.improvements || 'N/A'),
      finalFeedback: String(parsed.feedback || parsed.finalFeedback || 'N/A'),
    };
  } catch (err) {
    console.error('[geminiService] Evaluation failed:', err instanceof Error ? err.message : err);
    return getDynamicFallback(qaPairs);
  }
}

function normalizeScore(value: unknown, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(max, Math.max(0, Math.round(n)));
}

function getDynamicFallback(qaPairs: QAPair[]): EvaluationResult {
  const avgAnswerLength = qaPairs.reduce((acc, qa) => acc + (qa.answer?.length || 0), 0) / (qaPairs.length || 1);

  // Heuristic based on answer length as a proxy for effort
  const base = Math.min(85, Math.max(40, 45 + (avgAnswerLength / 10)));
  const variation = () => Math.floor(Math.random() * 11) - 5; // -5 to +5

  return {
    overallScore: Math.round(base + variation()),
    relevance: Math.min(10, Math.max(4, Math.round((base / 10) + (variation() / 2)))),
    fluency: Math.min(10, Math.max(4, Math.round((base / 10) + (variation() / 2)))),
    confidence: Math.min(10, Math.max(4, Math.round((base / 10) + (variation() / 2)))),
    strengths: 'Candidate participated in the interview and provided responses.',
    improvements: 'Focus on providing more detailed and structured answers.',
    finalFeedback: 'The AI evaluation skipped due to a technical error. This is a heuristic-based estimate.',
  };
}
