// Auth Routes
import express from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/UserModel.js';
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { PromptUsageManager } from '../services/PromptUsageManager.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // More lenient in development
  message: { error: 'Too many attempts, please try again later' },
});

// Register
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('Received signup request:📲', { email, name });

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Creating new user🧔🧑🏼‍🦰', email, name);

    // Create user
    const user = new User({
      name,
      email,
      password,
      subscriptionTier: 'free', // default tier
      promptsLeft: 3, // default prompts
      dailyUsage: {
        count: 0,
        lastReset: Date.now(),
      },
    });

    await user.save();

    console.log('User created successfully!🎉', user.email);

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Get usage stats using UsageManager
    const usageStats = await PromptUsageManager.getUsageStats(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        usageCount: usageStats.dailyUsage.count,
        remainingPrompts: usageStats.remainingPrompts,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  console.log('Login request received:', req.body);
  console.log('Login route hit!');
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    console.log('🔍Finding user with email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, checking password...');

    // Check password
    const isValidPassword = await user.comparePassword(password);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    // console.log('Generating token for user:', user._id);
    // const token = generateToken(user._id);

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Get usage stats using UsageManager
    const usageStats = await PromptUsageManager.getUsageStats(user._id);

    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        remainingPrompts: usageStats.remainingPrompts,
        canUsePrompt: usageStats.canUsePrompt,
      },
    });
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({ error: 'Database connection error' });
    }

    res.status(500).json({ error: 'login failed - server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    console.log('Getting profile for user:', user._id);

    // Get usage stats using UsageManager
    const usageStats = await PromptUsageManager.getUsageStats(user._id);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        remainingPrompts: usageStats.remainingPrompts,
        subscriptionStatus: user.subscriptionData?.status || 'inactive',
        canUsePrompt: usageStats.canUsePrompt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get usage stats
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    console.log('Getting usage stats for user:', user._id);

    // Get comprehensive usage stats using UsageManager
    const usageStats = await PromptUsageManager.getUsageStats(user._id);

    res.json(usageStats);
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

export default router;
