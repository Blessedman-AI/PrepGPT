import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QuizDisplay from '../components/QuizDisplay';
// import QuizDisplay from '../components/QuizDisplay';

/**
 * Quiz Display Screen
 *
 * This screen displays the quiz questions and handles user interactions
 * It expects quiz questions to be passed as route params
 */
const QuizDisplayScreen = () => {
  // Get the passed questions from route params
  const params = useLocalSearchParams();

  // If questions were passed as a stringified JSON, parse them
  const questions = params.questions
    ? typeof params.questions === 'string'
      ? JSON.parse(params.questions)
      : params.questions
    : [];

  return (
    <View style={styles.container}>
      <QuizDisplay route={{ params: { questions } }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
});

export default QuizDisplayScreen;
