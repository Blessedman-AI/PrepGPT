// Get the API URL from the build environment
const LOCAL_SERVER_URL = 'http://192.168.188.3:5000/api';
// const apiUrl = process.env.EXPO_PUBLIC_API_URL || LOCAL_SERVER_URL;
const apiUrl = 'http://192.168.188.3:5000/api';
// Determine build type based on API URL or use a more reliable method
const getBuildType = () => {
  if (apiUrl.includes('192.168')) {
    return 'development';
  }
  return 'production';
};
// const getBuildType = () => {
//   if (apiUrl.includes('192.168')) {
//     return 'development';
//   } else if (apiUrl.includes('/')) {
//     return 'preview';
//   }
//   return 'production';
// };

const buildType = getBuildType();

const configs = {
  development: {
    name: 'PrepGPT Dev',
    package: 'com.bee2025.prepgpt.dev',
    bundleId: 'com.bee2025.prepgpt.dev',
  },
  preview: {
    name: 'PrepGPT Preview',
    package: 'com.bee2025.prepgpt.preview',
    bundleId: 'com.bee2025.prepgpt.preview',
  },
  internal: {
    name: 'PrepGPT Beta',
    package: 'com.bee2025.prepgpt.beta',
    bundleId: 'com.bee2025.prepgpt.beta',
  },
  production: {
    name: 'PrepGPT',
    package: 'com.bee2025.prepgpt',
    bundleId: 'com.bee2025.prepgpt',
  },
};

const config = configs[buildType];

export default {
  expo: {
    scheme: 'prepgpt',
    name: config.name,
    slug: 'prepgpt',
    version: '1.0.0',
    jsEngine: 'hermes',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-dark.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: config.bundleId,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      icon: {
        dark: './assets/ios-icons/ios-light.png',
        light: './assets/ios-icons/ios-dark.png',
        tinted: './assets/ios-icons/ios-tinted.png',
      },
    },
    android: {
      networkSecurityConfig: './network_security_config.xml',
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      buildToolsVersion: '34.0.0',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        monochromeImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: config.package,
    },
    web: {
      favicon: './assets/adaptive-icon.png',
    },
    extra: {
      // Make sure the API URL is properly passed through
      apiUrl: apiUrl,
      buildType: buildType,
      // Add these for debugging
      originalApiUrl: process.env.EXPO_PUBLIC_API_URL,
      defaultApiUrl: LOCAL_SERVER_URL,
      router: {},
      eas: {
        projectId: 'c0be2c28-bc94-463f-abf4-96f495007a50',
      },
    },
    plugins: ['expo-router'],
    owner: 'bee2025',
  },
};
