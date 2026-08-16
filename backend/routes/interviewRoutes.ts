/**
 * Interview API: start, answer (with TTS), history, get by id.
 * All require JWT except health.
 */

import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { startInterview, submitAnswer, getInterviewHistory, getInterviewById } from '../services/interviewService';
import { textToSpeech } from '../services/ttsService';
import { generateAvatarVideo } from '../services/avatarService';

const router = express.Router();

async function withRetryOnce<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn('[interviewRoutes] retry:', err);
    return await fn();
  }
}

router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const difficulty = (req.body.difficulty || 'beginner').toLowerCase();
    if (!['beginner', 'intermediate', 'expert'].includes(difficulty)) {
      res.status(400).json({ error: 'Invalid difficulty. Use beginner, intermediate, or expert.' });
      return;
    }
    const result = await startInterview(user._id.toString(), difficulty as 'beginner' | 'intermediate' | 'expert');

    // Return immediately; generate avatar in background so the user doesn't wait 30–60s
    void (async () => {
      try {
        const audioBuffer = await textToSpeech(result.spokenText);
        await withRetryOnce(() => generateAvatarVideo(audioBuffer));
      } catch (e) {
        console.warn('[interviewRoutes] TTS/avatar background failed:', e);
      }
    })();

    res.json({
      interviewId: result.interviewId,
      reply: result.reply || '',
      question: result.spokenText,
      questionNumber: result.questionNumber,
      totalQuestions: result.totalQuestions,
      videoUrl: '', // Avatar generated in background; frontend uses browser TTS when empty
    });
  } catch (err) {
    console.error('[interviewRoutes] start error:', err);
    res.status(500).json({
      error: 'Failed to start interview',
      message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

router.post('/answer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { interviewId, transcript } = req.body;
    if (!interviewId || typeof transcript !== 'string') {
      res.status(400).json({ error: 'interviewId and transcript required' });
      return;
    }

    const result = await submitAnswer(interviewId, user._id.toString(), transcript);

    let videoUrl = '';
    try {
      const audioBuffer = await textToSpeech(result.spokenText);
      videoUrl = await withRetryOnce(() => generateAvatarVideo(audioBuffer));
    } catch (e) {
      console.warn('[interviewRoutes] TTS failed for answer:', e);
    }

    const payload: Record<string, unknown> = {
      reply: result.reply || '',
      question: result.spokenText,
      questionNumber: result.questionNumber,
      totalQuestions: result.totalQuestions,
      isComplete: result.isComplete,
      isRepeat: result.isRepeat,
      interviewId: result.interviewId,
      videoUrl,
    };
    if (result.scores) {
      const toTen = (n: number) => Math.min(10, Math.max(1, Math.round(n / 10)));
      payload.scores = {
        overall: toTen(result.scores.overallScore),
        relevance: toTen(result.scores.relevance),
        fluency: toTen(result.scores.fluency),
        confidence: toTen(result.scores.confidence),
      };
      payload.strengths = result.scores.strengths;
      payload.improvements = result.scores.improvements;
      payload.finalFeedback = result.scores.finalFeedback;
    }
    res.json(payload);
  } catch (err) {
    console.error('[interviewRoutes] answer error:', err);
    res.status(500).json({
      error: 'Failed to submit answer',
      message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const list = await getInterviewHistory(user._id.toString());
    res.json({ interviews: list });
  } catch (err) {
    console.error('[interviewRoutes] history error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const interview = await getInterviewById(req.params.id, user._id.toString());
    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }
    res.json(interview);
  } catch (err) {
    console.error('[interviewRoutes] getById error:', err);
    res.status(500).json({ error: 'Failed to get interview' });
  }
});

export default router;
