import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QuizResults from '../components/QuizResults';

/**
 * Quiz Results Screen
 *
 * This screen displays the results after completing a quiz
 * It expects results to be passed as route params
 */
const QuizResultsScreen = () => {
  // Get the results from route params
  const params = useLocalSearchParams();

  // If results were passed as a stringified JSON, parse them
  const results = params.results
    ? typeof params.results === 'string'
      ? JSON.parse(params.results)
      : params.results
    : null;

  return (
    <View style={styles.container}>
      <QuizResults route={{ params: { results } }} />
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

export default QuizResultsScreen;
