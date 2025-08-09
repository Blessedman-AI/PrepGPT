// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import { PromptUsageManager } from '../services/PromptUsageManager.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    // Add user info to request object
    req.user = user; // Store the full user object

    next();
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

// Optional: Middleware to check subscription tier
export const requirePremium = (req, res, next) => {
  if (req.user.subscriptionTier !== 'premium') {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
    });
  }
  next();
};

// Middleware to check if user can use prompts (using UsageManager)
export const checkPromptUsage = async (req, res, next) => {
  console.log('🅰️authMiddleware - Check Prompt usage route hit!');
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Use UsageManager to check if user can make a request
    const usageCheck = await PromptUsageManager.canUserMakeRequest(user._id);

    if (!usageCheck.canUse) {
      return res.status(429).json({
        success: false,
        message:
          'Daily prompt limit reached. Upgrade to premium for unlimited access.',
        remainingPrompts: usageCheck.remainingPrompts || 0,
      });
    }

    // Add updated user object to request
    req.userDoc = usageCheck.user;
    next();
  } catch (error) {
    console.error('Error checking prompt usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limits',
    });
  }
};

// Middleware to use a prompt (decrement counter)
export const usePrompt = async (req, res, next) => {
  console.log('🅰️authMiddleware - UsePrompt route hit!');
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Use UsageManager to consume a prompt
    const usageResult = await PromptUsageManager.usePrompt(user._id);
    console.log('🩸usageResult - ', usageResult.error);

    if (!usageResult.success) {
      return res.status(403).json({
        success: false,
        message: usageResult.error,
        remainingPrompts: usageResult.remainingPrompts,
      });
    }
    // console.log('usage feedback', usageResult);

    // Add updated user object and usage info to request
    req.userDoc = usageResult.user;
    req.usageResult = usageResult;
    next();
  } catch (error) {
    console.error('Error using prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process prompt usage',
    });
  }
};
