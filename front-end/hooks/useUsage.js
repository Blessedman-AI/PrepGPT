// hooks/useUsage.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';

export const useUsage = () => {
  const { apiCall, user } = useAuth();
  const [usageStats, setUsageStats] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current usage stats
  const fetchUsageStats = useCallback(async () => {
    try {
      setUsageLoading(true);
      // console.log('📩fetching usage stats');
      setError(null);

      // console.log('📞 About to call /usage/stats');

      const response = await apiCall('/usage/stats');
      // console.log('📦 Got response from /usage/stats:', response);
      // console.log('📦 Response.data:', response.data);
      // console.log('📦 Response.data.data:', response.data.data);

      if (response.data.success) {
        // console.log('✅ Setting usageStats to:', response.data.data);
        setUsageStats(response.data.data);

        // console.log(
        //   '🔍 Setting usageStats to:',
        //   JSON.stringify(response.data.data, null, 2)
        // );
      } else {
        console.log('❌ API returned success: false');
        setError(response?.data?.error);
      }
    } catch (err) {
      console.log('💥 Error in fetchUsageStats:', err);
      setError(err.message || 'Failed to fetch usage stats');
    } finally {
      // console.log('🏁 fetchUsageStats finished');
      setUsageLoading(false);
    }
  }, [apiCall]);

  // console.log('🔃 usage Loading is', usageLoading);

  // Check if user can use a prompt
  const canUsePrompt = useCallback(async () => {
    try {
      console.log('📥Checking if user can use prompt');
      const response = await apiCall('/usage/can-use');
      console.log('🩸🥇canUsePrompt response:', response.data.data);
      return response?.data?.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to check usage');
    }
  }, [apiCall]);

  // Note: You might not need this if you use the usePrompt middleware directly
  const usePrompt = useCallback(async () => {
    console.log('useUsage error: UsePrompt function reached');
    try {
      const response = await apiCall('/usage/use-prompt', {
        method: 'POST',
      });

      if (response.data.success) {
        // Refresh usage stats after successful use
        await fetchUsageStats();
        return {
          success: true,
          remainingPrompts: response.data.remainingPrompts,
        };
      } else {
        return {
          success: false,
          error: response.data.error,
          remainingPrompts: response.data.remainingPrompts,
        };
      }
    } catch (err) {
      console.error('🤡 useUsage Error message:', err);
      return {
        success: false,
        error: err.message || 'Failed to use prompt',
      };
    }
  }, [apiCall, fetchUsageStats]);

  // Alternative: Generate quiz directly (if using usePrompt middleware)
  const generateQuiz = useCallback(
    async (textContent, numQuestions, inputTab) => {
      try {
        const response = await apiCall('/quiz/generate', {
          method: 'post',
          data: {
            content: textContent,
            numQuestions,
            source: inputTab,
          },
        });

        const result = response.data.result;

        if (response.data.success) {
          // Refresh usage stats since prompt was consumed by middleware
          await fetchUsageStats();
        } else {
          throw new Error(response.data.error || 'Quiz generation failed');
        }
        // Ensure we have the questions array
        let parsedQuestions = [];
        if (result.questions) {
          parsedQuestions = result.questions;
        } else if (Array.isArray(result)) {
          parsedQuestions = result;
        } else {
          throw new Error('Invalid question format returned from API');
        }

        return parsedQuestions;
      } catch (err) {
        const errorMessage = err.message;

        console.error('📥 useUsage Error message:', errorMessage);
        throw new Error(
          errorMessage || 'Failed to generate quiz. Pleae try again.'
        );
      }
    },
    [apiCall, fetchUsageStats]
  );

  // console.log('🧪 Direct API values:', {
  //   apiRemainingPrompts: usageStats?.remainingPrompts,
  //   apiCanUsePrompt: usageStats?.canUsePrompt,
  //   apiPromptsLeft: usageStats?.promptsLeft,
  // });

  // Helper functions for UI
  const isPremium = usageStats?.subscriptionTier === 'premium';
  const canUse = isPremium || usageStats?.remainingPrompts > 0;
  const remainingPrompts = isPremium
    ? 'unlimited'
    : usageStats?.remainingPrompts || 0;

  useEffect(() => {
    // console.log('💵🚿 useUsage effect - checking user:', user);
    if (user) {
      // console.log('👤 User exists, calling fetchUsageStats');
      fetchUsageStats();
    } else {
      console.log('👤 No user, skipping fetchUsageStats');
    }
  }, [user, fetchUsageStats]);
  // console.log('🪴canUse is', {
  //   isPremium,
  //   remainingPrompts,
  //   canUse,
  //   usageStats,
  // });

  return {
    usageStats,
    usageLoading,
    error,
    fetchUsageStats,
    canUsePrompt,
    usePrompt,
    generateQuiz, // New method for direct quiz generation
    // Helper values
    isPremium,
    canUse,
    remainingPrompts,
    dailyLimit: usageStats?.dailyLimit || 3,
  };
};
