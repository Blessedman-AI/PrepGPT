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

// Add the new optional middleware AFTER the existing ones
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Initialize as false
  req.isAuthenticated = false;
  req.user = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      console.log('🔍 optionalAuth: Token received, length:', token.length);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('🔍 optionalAuth: Token decoded successfully');
      // console.log('🔍 optionalAuth: Decoded payload:', {
      //   id: decoded.id, // Changed from userId to id
      //   exp: decoded.exp,
      //   iat: decoded.iat,
      // });

      const user = await User.findById(decoded.id); // Changed from decoded.userId to decoded.id
      // console.log('🔍 optionalAuth: Database lookup result:', {
      //   userFound: !!user,
      //   searchedId: decoded.id, // Changed from decoded.userId to decoded.id
      //   userIdType: typeof decoded.id, // Changed from decoded.userId to decoded.id
      // });

      if (user) {
        req.user = user;
        req.isAuthenticated = true;
        // console.log('✅ optionalAuth: User authenticated successfully', {
        //   userId: user._id,
        //   email: user.email,
        // });
      } else {
        console.log(
          '❌ optionalAuth: User not found in database for ID:',
          decoded.id
        );
      }
    } catch (error) {
      console.log('❌ optionalAuth: Token error:', error.message);
    }
  } else {
    console.log('🔍 optionalAuth: No auth header found');
  }

  // console.log('🔍 optionalAuth final state:', {
  //   isAuthenticated: req.isAuthenticated,
  //   hasUser: !!req.user,
  //   userId: req.user?._id,
  // });

  next();
};

// This MUST come after optionalAuth because it depends on req.isAuthenticated
export const optionalUsePrompt = async (req, res, next) => {
  console.log('🔍 optionalUsePrompt middleware called');
  console.log('- req.isAuthenticated:', req.isAuthenticated);
  console.log('- req.user exists:', !!req.user);

  // If user is authenticated, use the prompt
  if (req.isAuthenticated && req.user) {
    console.log('🔄 Authenticated user - calling PromptUsageManager.usePrompt');
    try {
      const usageResult = await PromptUsageManager.usePrompt(req.user._id);

      if (!usageResult.success) {
        return res.status(403).json({
          success: false,
          message: usageResult.error,
          remainingPrompts: usageResult.remainingPrompts,
        });
      }

      req.usageResult = usageResult;
      console.log('✅ Usage updated, continuing to route handler');
    } catch (error) {
      console.error('Error in optionalUsePrompt:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process prompt usage',
      });
    }
  } else {
    // Otherwise, set a default usageResult for guest users
    console.log('👤 Guest user - setting default usage result');
    // For guest users, set a default usageResult
    req.usageResult = {
      success: true,
      remainingPrompts: 'unlimited (1 question per quiz)',
      user: null,
    };
  }

  next();
};
