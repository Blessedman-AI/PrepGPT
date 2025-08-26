import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/authContext.js';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

const AuthenticatedLayout = () => {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Hide splash screen after 3 seconds (3000ms)
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Failed to hide splash screen:', error);
        // Splash screen might already be hidden, which is fine
      }
    }, 2000); // Adjust this duration as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't navigate while still loading auth state
    if (isLoading || segments.length === 0) return;

    // console.log('🧭 Navigation check:', { isAuthenticated, segments });

    const inAuthScreen =
      segments.includes('login') || segments.includes('signup');
    const protectedScreens = ['paywall'];
    const protectedTabRoutes = ['account', 'settings']; // Protect both account and settings tabs

    const inProtectedScreen = protectedScreens.some((screen) =>
      segments.includes(screen)
    );

    const inProtectedTabRoutes =
      segments.includes('(tabs)') &&
      protectedTabRoutes.some((route) => segments.includes(route));

    if (
      !isAuthenticated &&
      !inAuthScreen &&
      (inProtectedScreen || inProtectedTabRoutes)
    ) {
      // User is not authenticated and not on auth screens
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreen) {
      // User is authenticated but on auth screens
      console.log('✅ Authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            // presentation: 'formSheet',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
            presentation: 'modal',
            // headerShown: true,
            // headerRight: () => (
            //   <TouchableOpacity
            //     onPress={() => router.push('/')} // Using router directly
            //     style={{ marginLeft: 15 }}
            //   >
            //     <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
            //   </TouchableOpacity>
            // ),
          }}
        />
        <Stack.Screen name="signup" options={{ title: 'Signup' }} />
        <Stack.Screen
          name="quiz-display"
          options={{
            title: 'Quiz',
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="quiz-results"
          options={{
            title: 'Results',
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <AuthenticatedLayout />
    </AuthProvider>
  );
};

export default RootLayout;
