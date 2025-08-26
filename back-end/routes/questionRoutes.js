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

// Helper function to validate question limits based on user status
const validateQuestionLimit = (numQuestions, isAuthenticated, user) => {
  const questionCount = parseInt(numQuestions, 10);

  // Basic validation
  if (!questionCount || questionCount < 1 || questionCount > 15) {
    throw new Error('Invalid number of questions. Must be between 1 and 15.');
  }

  // Non-authenticated users: maximum 1 question
  if (!isAuthenticated) {
    if (questionCount > 1) {
      throw new Error('Please log in to generate more than 1 question.');
    }
    return 1; // Force to 1 for non-authenticated users
  }

  // Authenticated but not premium: maximum 3 questions
  // Assuming you have user.isPremium or similar field
  if (user && !user.isPremium && questionCount > 3) {
    throw new Error('Upgrade to Premium to generate more than 3 questions.');
  }

  // Return the validated question count
  return questionCount;
};

// Question generation endpoint
router.post('/generate', optionalAuth, optionalUsePrompt, async (req, res) => {
  try {
    const { numQuestions, content, source } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Validate question limits based on user status
    const validatedQuestionCount = validateQuestionLimit(
      numQuestions,
      req.isAuthenticated,
      req.user
    );

    const systemPrompt = getSystemPrompt(source);
    const userPrompt = generatePrompt(validatedQuestionCount, content, source);

    // console.log('🧬 questionRoutes: Generating questions for source:', source);
    // console.log(`🔢 Generating ${validatedQuestionCount} questions for user:`,
    //   req.isAuthenticated ? (req.user?.isPremium ? 'Premium' : 'Free') : 'Guest'
    // );

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
    const resultObject = JSON.parse(resultString);

    return res.json({
      success: true,
      result: resultObject,
      remainingPrompts: req.usageResult.remainingPrompts,
      actualQuestions: validatedQuestionCount, // Let frontend know how many were actually generated
    });
  } catch (error) {
    console.error(
      '❌QuestionRoutes: Error generating questions (detailed):',
      error
    );

    // Handle validation errors with appropriate status codes
    if (
      error.message.includes('Please log in') ||
      error.message.includes('Upgrade to Premium') ||
      error.message.includes('Invalid number of questions')
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (error.message.includes('bad XRef entry')) {
      return res.status(400).json({
        error: 'An error occurred. Please try again',
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to generate questions',
    });
  }
});

function getSystemPrompt(source) {
  if (source === 'document') {
    return 'You are a specialized quiz generation assistant that creates high-quality quiz questions based on the provided document content. Your goal is to test understanding of the material while ensuring questions are clear, relevant, and varied in difficulty.';
  } else {
    return "You are a specialized quiz generation assistant that creates high-quality quiz questions based on user prompts. You follow the user's instructions regarding topics, difficulty, and style, if specified, while ensuring questions are educational, engaging, and well-formatted. IMPORTANT: For each request, especially 'random topic' requests, generate DIFFERENT questions on DIFFERENT topics each time. Never repeat the same topic or question patterns across requests. If the user simply pastes a block of text, create a high quality quiz from the text with varying difficulty levels.";
  }
}

function generatePrompt(validatedQuestionCount, content, source) {
  if (source === 'document') {
    // For document-based quizzes
    return `
- Generate ${validatedQuestionCount} questions based on the following document content:
${content}

- Include a mix of single-choice (one correct answer) and multi-choice (multiple correct answers) questions.
- Ensure the questions are clear, relevant, and unambiguous.
- Do your best to not repeat questions. If you must repeat questions across different instances, ask the question in a different way.
- Each question should test understanding of key concepts in the material.
- Cover content from different sections of the material.
- If the input is too short, generate fewer questions proportionally.
- Avoid vague or overly simple questions. Ensure they test comprehension.
- DO NOT create yes/no questions. Only create single-choice or multi-choice questions.

Additional Notes:
- If a passage contains technical or scientific terms, ensure questions match the complexity.
- If definitions, dates, or key figures are present, include factual recall questions.
- If the passage is argumentative or analytical, include reasoning-based questions.
- Each multi-choice question must have multiple correct answers, not just one.
- Format each question as a JSON object with the following structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct answer here", // For single-choice
      // OR
      "correctAnswer": ["Correct answer 1", "Correct answer 2"], // For multi-choice
      "type": "single-choice" // Use "multi-choice" for multiple correct answers
    }
  ]
}
Return all questions in a JSON array.
`;
  } else {
    // For prompt-based quizzes
    let promptText = `
I need you to create a quiz according to these instructions:

${content}`;

    // Special handling for random topic requests
    if (
      content?.toLowerCase().includes('random topic') ||
      content?.toLowerCase().includes('quiz me')
    ) {
      promptText += `
IMPORTANT: Choose a DIFFERENT random topic than what you've chosen before. Do not pick astronomy, planets, or space unless explicitly requested. Vary between technology, history, science, literature, geography, sports, or other interesting domains. Each request should produce questions from a completely different domain.`;
    }

    promptText += `

Please generate ${validatedQuestionCount} questions, using only single-choice or multi-choice question types.

Format the questions in this JSON structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct answer here", // For single-choice
      // OR
      "correctAnswer": ["Correct answer 1", "Correct answer 2"], // For multi-choice
      "type": "single-choice" // Use "multi-choice" for multiple correct answers
    }
  ]
}

Example of multi-choice structure:
{
  "question": "Which of the following are programming languages?",
  "options": ["HTML", "Python", "CSS", "JavaScript"],
  "correctAnswer": ["Python", "JavaScript"],
  "type": "multi-choice"
}

Important requirements:
- Follow the user's instructions regarding topics, difficulty level, and style. Where difficulty level is not specified by the user, generate questions varying in difficulty.
- Do not generate the same questions for the same prompts. Randomise and vary questions as much as possible even if the prompts are similar.
- Where there are no instructions but content is simply sent, generate a high-quality quiz from it varying in difficulty.
- Create questions that are clear, educational, and engaging
- Ensure correct answers are accurate and unambiguous
- For multiple-choice questions, include plausible distractors
- For multi-choice, interpret this as multiple **correct** answers per question (i.e., more than one correct answer must be selected).
- Each multi-choice question should have at least **two** correct answers listed in the "correctAnswer" array.
- DO NOT create yes/no questions. Only create single-choice or multi-choice questions.

- Return ONLY valid JSON with no additional text
`;
    return promptText;
  }
}

export default router;
