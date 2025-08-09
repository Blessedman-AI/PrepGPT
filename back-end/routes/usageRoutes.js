// routes/usage.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { PromptUsageManager } from '../services/PromptUsageManager.js';

const router = express.Router();

// Get user's usage stats
router.get('/stats', async (req, res) => {
  // console.log('✅Stats endpoint reached!'); // Log the user ID
  try {
    const stats = await PromptUsageManager.getUsageStats(req.user._id);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Check if user can make a request (before attempting to use prompt)
router.get('/can-use', async (req, res) => {
  try {
    const result = await PromptUsageManager.canUserMakeRequest(req.user._id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Use a prompt (call this when user actually uses the AI)
router.post('/use-prompt', async (req, res) => {
  try {
    const result = await PromptUsageManager.usePrompt(req.user._id);
    res.json(result);
  } catch (error) {
    console.log('usageRoutes error', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
