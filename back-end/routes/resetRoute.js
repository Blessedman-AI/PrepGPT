// In your routes file
import express from 'express';
import { PromptUsageManager } from '../services/PromptUsageManager.js';

const router = express.Router();

router.post('/usage/:userId', async (req, res) => {
  try {
    // console.log('🔄 Reset endpoint reach by', req.params.userId); // Log the user ID
    const { userId } = req.params;
    const user = await PromptUsageManager.resetDailyUsage(userId);
    res.json({
      success: true,
      message: 'Usage reset successfully',
      promptsLeft: user.promptsLeft,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
