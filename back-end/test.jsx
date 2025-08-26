import express from 'express';
import OpenAI from 'openai';
import {
  authenticateToken,
  optionalAuth,
  optionalUsePrompt,
  usePrompt,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Question generation endpoint
router.post('/generate', optionalAuth, optionalUsePrompt, async (req, res) => {
  // console.log('Received request body:🩸', req.body); // Log the request body

  try {
    const { numQuestions, content, source } = req.body;
    // Convert to number if it's a string

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const questionCount = parseInt(numQuestions, 10);

    // Basic validation
    if (!questionCount || questionCount < 1 || questionCount > 15) {
      throw new Error('Invalid number of questions. Must be between 1 and 15.');
    }

    // Limit questions for guest users
    const actualNumQuestions = req.isAuthenticated
      ? numQuestions
      : Math.min(numQuestions, 1);

    const systemPrompt = getSystemPrompt(source);
    const userPrompt = generatePrompt(numQuestions, content, source);

    // console.log('🧬 questionRoutes: Generating questions for source:', source);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0,
    });

    const resultString = completion.choices[0].message.content;
    const resultObject = JSON.parse(resultString); // Convert string to JS object
    return res.json({
      success: true,
      result: resultObject,
      remainingPrompts: req.usageResult.remainingPrompts,
    }); // Now sending real object inside JSON response
  } catch (error) {
    console.error(
      '❌QuestionRoutes: Error generating questions (detailed):',
      error
    );
    if (error.message.includes('bad XRef entry')) {
      return res.status(400).json({
        error: 'An error occured. Please try again',
      });
    }
    return res.status(500).json({
      error: error.message || 'Failed to generate questions',
    });
  }
});
