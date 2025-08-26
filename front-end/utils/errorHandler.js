const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'An unknown error occurred',
  DAILY_PROMPT_LIMIT:
    'Daily prompt limit reached. Upgrade to premium for unlimited access.',
  FORBIDDEN: 'Access forbidden',
  BAD_CREDENTIALS: 'Invalid credentials provided',
  DATABASE_ERROR: 'Database connection error occurred',
  ERR_NETWORK: 'Network error - please check your connection',
  ERR_TIMEOUT: 'Request timeout - please try again',
  SERVER_UNAVAILABLE: 'Server is currently unavailable',
};

const getErrorMessage = (error) => {
  console.error('🚨 getErrorMessage CALLED');
  console.log('🔍 STARTING ERROR HANDLER');
  console.log('⚡ Full error object:', error);

  // More specific checks
  console.log('🔍 error.response exists?', !!error.response);
  console.log(
    '🔍 error.response truthy check:',
    error.response ? 'TRUTHY' : 'FALSY'
  );

  let message = ERROR_MESSAGES.UNKNOWN_ERROR;

  if (error.response) {
    console.log('✅ INSIDE if (error.response) block');

    try {
      const { status, data } = error.response;
      console.log('❤️‍🩹 error.response.status:', status, data);

      console.log('🔍 Checking data.message for daily limit...');
      if (data?.message?.includes('Daily prompt limit reached')) {
        console.log('🎯 Setting DAILY_PROMPT_LIMIT message');
        message = ERROR_MESSAGES.DAILY_PROMPT_LIMIT;
      } else if (status === 403) {
        console.log('🎯 Setting FORBIDDEN message');
        message = ERROR_MESSAGES.FORBIDDEN;
      } else if (data?.error?.includes('Invalid credentials')) {
        console.log('🎯 Setting BAD_CREDENTIALS message');
        message = ERROR_MESSAGES.BAD_CREDENTIALS;
      } else if (data?.error?.includes('Database connection error')) {
        console.log('🎯 Setting DATABASE_ERROR message');
        message = ERROR_MESSAGES.DATABASE_ERROR;
      } else if (data?.message) {
        console.log('🎯 Using server message:', data.message);
        message = data.message;
      }

      console.log('🔍 Finished processing error.response block');
    } catch (processingError) {
      console.error('🔴 Error processing response:', processingError);
      message = ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  } else if (error.code === 'ERR_NETWORK') {
    console.log('🎯 Setting ERR_NETWORK message');
    message = ERROR_MESSAGES.ERR_NETWORK;
  } else if (
    error.code === 'ECONNABORTED' ||
    error.message?.includes('timeout')
  ) {
    console.log('🎯 Setting ERR_TIMEOUT message');
    message = ERROR_MESSAGES.ERR_TIMEOUT;
  } else if (error.message?.includes('ECONNREFUSED')) {
    console.log('🎯 Setting SERVER_UNAVAILABLE message');
    message = ERROR_MESSAGES.SERVER_UNAVAILABLE;
  } else if (error.message?.includes('Network Error')) {
    console.log('🎯 Setting ERR_NETWORK message (from Network Error)');
    message = ERROR_MESSAGES.ERR_NETWORK;
  } else {
    console.log('❌ No conditions matched - using default error message');
    console.log('❌ error.response was:', error.response);
    console.log('❌ error.code was:', error.code);
    console.log('❌ error.message was:', error.message);
  }

  console.log('✋🏼🐷 Modified Error message:', message);
  return message;
};

export default getErrorMessage;
