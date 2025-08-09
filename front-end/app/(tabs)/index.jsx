import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import QuizGenerator from '../../components/QuizGenerator';
import { useAuth } from '../../contexts/authContext';

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Use auth's isLoading
  // Remove: const [isLoading, setIsLoading] = useState(true);

  // console.log(
  //   '🏠 Home screen render - isAuthenticated:',
  //   isAuthenticated,
  //   'isLoading:',
  //   isLoading
  // );
  useEffect(() => {
    // Add global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      console.log('🚨 ERROR CAUGHT:', ...args);
      originalConsoleError(...args);
    };

    // Log app startup
    console.log('🚀 App starting...');
    console.log('📍 API URL:', process.env.EXPO_PUBLIC_API_URL);

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <QuizGenerator />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
});
