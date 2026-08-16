const express = require('express');
const router = express.Router();
const { evaluateAnswer } = require('../utils/evaluate');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/evaluate
 * Evaluate user's answer using OpenAI GPT
 */
router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Validate input
    if (!question || !answer) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both question and answer are required'
      });
    }

    if (typeof question !== 'string' || typeof answer !== 'string') {
      return res.status(400).json({
        error: 'Invalid input type',
        message: 'Question and answer must be strings'
      });
    }

    if (answer.trim().length < 10) {
      return res.status(400).json({
        error: 'Answer too short',
        message: 'Please provide a more detailed answer (at least 10 characters)'
      });
    }

    console.log('Evaluating answer for question:', question);

    // Evaluate the answer
    const evaluation = await evaluateAnswer(question, answer);

    res.json({
      success: true,
      evaluation,
      message: 'Answer evaluated successfully'
    });

  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({
      error: 'Evaluation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/evaluate/batch
 * Evaluate multiple answers at once
 */
router.post('/evaluate/batch', authMiddleware, async (req, res) => {
  try {
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Evaluations must be a non-empty array'
      });
    }

    const results = [];

    // Process each evaluation
    for (const item of evaluations) {
      const { question, answer } = item;

      if (!question || !answer) {
        results.push({
          error: 'Missing question or answer',
          evaluation: null
        });
        continue;
      }

      try {
        const evaluation = await evaluateAnswer(question, answer);
        results.push({
          success: true,
          evaluation
        });
      } catch (error) {
        results.push({
          error: error.message,
          evaluation: null
        });
      }
    }

    // Calculate overall statistics
    const successfulEvaluations = results.filter(r => r.success);
    const overallStats = {
      totalQuestions: evaluations.length,
      successfulEvaluations: successfulEvaluations.length,
      averageScore: 0,
      breakdown: {
        averageRelevance: 0,
        averageFluency: 0,
        averageConfidence: 0
      }
    };

    if (successfulEvaluations.length > 0) {
      const scores = successfulEvaluations.map(r => r.evaluation);
      overallStats.averageScore = Math.round(
        scores.reduce((sum, eval) => sum + eval.overallScore, 0) / scores.length
      );
      overallStats.breakdown.averageRelevance = Math.round(
        scores.reduce((sum, eval) => sum + eval.relevance, 0) / scores.length
      );
      overallStats.breakdown.averageFluency = Math.round(
        scores.reduce((sum, eval) => sum + eval.fluency, 0) / scores.length
      );
      overallStats.breakdown.averageConfidence = Math.round(
        scores.reduce((sum, eval) => sum + eval.confidence, 0) / scores.length
      );
    }

    res.json({
      success: true,
      results,
      overallStats,
      message: 'Batch evaluation completed'
    });

  } catch (error) {
    console.error('Batch evaluation error:', error);
    res.status(500).json({
      error: 'Batch evaluation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/evaluate/status
 * Check if evaluation service is available
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'available',
    message: 'OpenAI evaluation service is ready'
  });
});

module.exports = router;
