// routes/user.js
import express from 'express';
import User from '../models/UserModel.js';
import { PromptUsageManager } from '../services/PromptUsageManager.js';

const router = express.Router();

// GET /user/profile - Get current user's profile data
router.get('/profile', async (req, res) => {
  try {
    // Get user ID from the authenticated token (set by your auth middleware)
    const userId = req.user.id; // or req.user._id depending on your token payload

    // Get user with fresh usage data
    const user = await PromptUsageManager.getUserWithFreshUsage(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get remaining prompts
    const remainingPrompts =
      user.subscriptionTier === 'premium' ? 'unlimited' : user.promptsLeft;

    // Save any changes from the reset check
    await user.save();

    // Prepare response data
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      promptsLeft:
        user.subscriptionTier === 'premium' ? null : user.promptsLeft,
      dailyUsage: {
        count: user.dailyUsage.count,
        lastReset: user.dailyUsage.lastReset,
      },
      subscriptionData:
        user.subscriptionTier === 'premium'
          ? {
              stripeCustomerId: user.subscriptionData.stripeCustomerId,
              subscriptionId: user.subscriptionData.subscriptionId,
              currentPeriodEnd: user.subscriptionData.currentPeriodEnd,
              status: user.subscriptionData.status,
            }
          : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Additional computed fields
      remainingPrompts: remainingPrompts,
    };

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile data',
    });
  }
});

// PUT /user/profile - Update user profile (name, email)
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        subscriptionTier: updatedUser.subscriptionTier,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

// GET /user/usage - Get detailed usage statistics
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.id;
    const usageData = await PromptUsageManager.getUsageStats(userId);

    res.json({
      success: true,
      data: usageData,
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);

    // Handle specific error cases
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage data',
    });
  }
});

export default router;
