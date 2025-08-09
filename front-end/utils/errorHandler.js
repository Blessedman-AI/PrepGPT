const ERROR_MESSAGES = {
  ERR_NETWORK: 'Network error. Please check your connection.',
  ERR_TIMEOUT: 'Request timed out. Please try again.',
  TOKEN_EXPIRED: 'Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input.',
  UNKNOWN_ERROR: 'Something went wrong. Try again.',
  DATABASE_ERROR: 'Database error occurred. Please try again later.',
  DAILY_PROMPT_LIMIT:
    'You have reached your daily prompt limit. Upgrade to premium for unlimited access.',
  SERVER_UNAVAILABLE:
    'Server is currently unavailable. Please try again later.',
};

const getErrorMessage = (error) => {
  console.log('🔍 Server down error.message:', error.message);
  console.log('🔍 Server down error.code:', error.code);
  console.log('🔍 All error properties:', Object.getOwnPropertyNames(error));

  let message = ERROR_MESSAGES.UNKNOWN_ERROR;

  // Handle network errors first (most common when server is down)
  if (error.code === 'ERR_NETWORK') {
    message = ERROR_MESSAGES.ERR_NETWORK;
  }
  // Handle timeout errors
  else if (
    error.code === 'ECONNABORTED' ||
    error.message?.includes('timeout')
  ) {
    message = ERROR_MESSAGES.ERR_TIMEOUT;
  }
  // Handle connection refused (server not running)
  else if (error.message?.includes('ECONNREFUSED')) {
    message = ERROR_MESSAGES.SERVER_UNAVAILABLE;
  }
  // Handle generic network errors
  else if (error.message?.includes('Network Error')) {
    message = ERROR_MESSAGES.ERR_NETWORK;
  }
  // Handle server response errors (only if response exists)
  else if (error.response) {
    if (error.response.status === 403) {
      message = ERROR_MESSAGES.FORBIDDEN;
    } else if (error.response.status === 401) {
      message = ERROR_MESSAGES.TOKEN_EXPIRED;
    } else if (
      error.response.data?.error?.includes('Database connection error')
    ) {
      message = ERROR_MESSAGES.DATABASE_ERROR;
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }
  }
  // Handle specific message content
  else if (error.message?.includes('Daily prompt limit reached')) {
    message = ERROR_MESSAGES.DAILY_PROMPT_LIMIT;
  } else if (error.message?.includes('401')) {
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  }

  console.log('🩸🤢errorHandler', error.message);
  console.log('1️⃣errorHandler', error);
  console.log('✋🏼🐷errorHandler - Modified Error message:', message);
  return message;
};

export default getErrorMessage;
