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

  console.log(
    '🏠 Home screen render - isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading
  );

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
