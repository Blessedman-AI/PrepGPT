import User from '../models/UserModel.js';

export class PromptUsageManager {
  static LIMITS = {
    FREE_DAILY_LIMIT: 3,
  };

  /**
   * Get user with fresh usage data (handles daily reset automatically)
   */
  static async getUserWithFreshUsage(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Auto-reset if needed
    await this._checkAndResetDaily(user);
    return user;
  }

  /**
   * Check if user can make a request
   */
  static async canUserMakeRequest(userId) {
    const user = await this.getUserWithFreshUsage(userId);

    if (user.subscriptionTier === 'premium') {
      return { canUse: true, user };
    }

    return {
      canUse: user.promptsLeft > 0,
      user,
      remainingPrompts: user.promptsLeft,
    };
  }

  /**
   * Use a prompt (decrement counter and save)
   */
  static async usePrompt(userId) {
    console.log('📞PromptUsageManager.usePrompt function called');
    const user = await this.getUserWithFreshUsage(userId);

    if (user.subscriptionTier === 'premium') {
      return {
        success: true,
        remainingPrompts: 'unlimited',
        user,
      };
    }

    if (user.promptsLeft <= 0) {
      return {
        success: false,
        error:
          'Daily prompt limit reached. Upgrade to premium for unlimited access.',
        remainingPrompts: 0,
        user,
      };
    }

    // Decrement usage
    user.promptsLeft--;
    user.dailyUsage.count++;
    await user.save();

    return {
      success: true,
      remainingPrompts: user.promptsLeft,
      user,
    };
  }

  /**
   * Get detailed usage stats
   */
  static async getUsageStats(userId) {
    const user = await this.getUserWithFreshUsage(userId);

    // Save any changes from reset check
    // await user.save();

    return {
      subscriptionTier: user.subscriptionTier,
      dailyUsage: {
        count: user.dailyUsage.count,
        lastReset: user.dailyUsage.lastReset,
      },
      promptsLeft:
        user.subscriptionTier === 'premium' ? null : user.promptsLeft,
      remainingPrompts:
        user.subscriptionTier === 'premium' ? 'unlimited' : user.promptsLeft,
      canUsePrompt:
        user.subscriptionTier === 'premium' ? true : user.promptsLeft > 0,
      dailyLimit:
        user.subscriptionTier === 'free' ? this.LIMITS.FREE_DAILY_LIMIT : null,
    };
  }

  /**
   * Reset user's daily usage (for admin actions or subscription changes)
   */
  static async resetDailyUsage(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.subscriptionTier === 'free') {
      user.promptsLeft = this.LIMITS.FREE_DAILY_LIMIT;
      user.dailyUsage.count = 0;
      user.dailyUsage.lastReset = new Date();
      await user.save();
    }

    return user;
  }

  /**
   * Private method to check and reset daily usage
   */
  static async _checkAndResetDaily(user) {
    // Only apply daily reset logic to free tier users
    if (user.subscriptionTier !== 'free') {
      return user;
    }

    const now = new Date();
    const lastReset = new Date(user.dailyUsage.lastReset);

    // Reset if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
      console.log('🔄 Performing daily reset...');
      user.dailyUsage.count = 0;
      user.dailyUsage.lastReset = now;
      user.promptsLeft = this.LIMITS.FREE_DAILY_LIMIT;

      // Save the changes immediately
      await user.save();
      console.log('✅ Reset complete:', {
        newPromptsLeft: user.promptsLeft,
        newDailyCount: user.dailyUsage.count,
        newLastReset: user.dailyUsage.lastReset,
      });
    }

    return user;
  }
}
