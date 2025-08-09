import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';
import { AuthProvider, useAuth } from '../contexts/authContext.js';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';

import { useEffect } from 'react';

const AuthenticatedLayout = () => {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't navigate while still loading auth state
    if (isLoading) {
      // console.log('🔄 Still loading auth state, waiting...');
      return;
    }

    // console.log('🧭 Navigation check:', { isAuthenticated, segments });

    const inAuthScreen =
      segments.includes('login') || segments.includes('signup');
    const protectedScreens = ['paywall', 'quiz-display', 'quiz-results'];
    const inProtectedScreen = protectedScreens.some((screen) =>
      segments.includes(screen)
    );

    if (!isAuthenticated && !inAuthScreen) {
      // User is not authenticated and not on auth screens
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreen) {
      // User is authenticated but on auth screens
      console.log('✅ Authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

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
            headerShown: false,
          }}
        />

        <Stack.Screen name="login" options={{ title: 'Login' }} />
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
