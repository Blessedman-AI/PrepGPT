import { PromptUsageManager } from '../services/PromptUsageManager.js';

export const checkUsageLimit = async (req, res, next) => {
  console.log('🤮usageMiddleware function called');
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or missing user ID',
      });
    }

    const { canUse, user, remainingPrompts } =
      await PromptUsageManager.canUserMakeRequest(req.user.id);

    if (!canUse) {
      return res.status(429).json({
        success: false,
        message:
          'Daily prompt limit reached. Upgrade to premium for unlimited access.',
        remainingPrompts: 0,
      });
    }

    // Attach user document to request for easy access
    req.userDoc = user;
    next();
  } catch (error) {
    console.error('Error checking usage limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limits',
    });
  }
};
