const getApiUrl = () => {
  const buildType = process.env.EXPO_PUBLIC_BUILD_TYPE;

  console.log('🔧 API Config Debug:');
  console.log('- Build Type:', buildType, typeof buildType);
  console.log('- EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log(
    '- All EXPO env vars:',
    Object.keys(process.env).filter((key) => key.startsWith('EXPO'))
  );

  // Add explicit check for undefined/null
  if (buildType === 'development') {
    const devUrl = 'http://192.168.110.3:5000/api';
    console.log('✅ Using development URL:', devUrl);
    return devUrl;
  }

  // Fallback: if buildType is undefined, assume development for now
  if (!buildType || buildType === undefined) {
    const fallbackUrl = 'http://192.168.110.3:5000/api';
    console.log(
      '⚠️ BuildType is undefined, using fallback development URL:',
      fallbackUrl
    );
    return fallbackUrl;
  }

  // Use environment variable for other builds
  const prodUrl = process.env.EXPO_PUBLIC_API_URL;
  console.log('✅ Using production URL:', prodUrl);
  return prodUrl;
};

export const API_URL = getApiUrl();
console.log('📡 Final exported API_URL:', API_URL);

// You can also export the function itself if you need it elsewhere
export { getApiUrl };
