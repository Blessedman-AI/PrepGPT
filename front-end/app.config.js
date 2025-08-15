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

// Use a dedicated environment variable for build type instead of inferring from API URL
const buildType = process.env.EXPO_PUBLIC_BUILD_TYPE || 'production';
const config = configs[buildType];

export default {
  expo: {
    scheme: 'prepgpt',
    name: config.name,
    slug: 'prepgpt',
    version: '1.0.0',
    jsEngine: 'hermes',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    // splash: {
    //   image: './assets/splash-dark.png',
    //   resizeMode: 'contain',
    //   backgroundColor: '#ffffff',
    //   dark: {
    //     image: './assets/splash-light.png',
    //     resizeMode: 'contain',
    //     // backgroundColor: '#66b2b2',
    //     backgroundColor: '#3a3a3aff',
    //   },
    // },
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
      buildType: buildType,
      router: {},
      eas: {
        projectId: '95d81974-444b-482a-9481-225ce2e2d186',
      },
      // eas: {
      //   projectId: 'c0be2c28-bc94-463f-abf4-96f495007a50',
      // },
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/splash-dark.png',
          resizeMode: 'contain',
          dark: {
            image: './assets/splash-light.png',
            resizeMode: 'contain',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
    ],
    owner: 'diokpa',
    // owner: 'bee2025',
  },
};
