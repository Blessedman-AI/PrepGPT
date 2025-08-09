import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  //   SafeAreaView,
  TouchableOpacity,
  //   StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const QuizResults = ({ route }) => {
  const navigation = useNavigation();
  const { results } = route.params;
  const router = useRouter();

  // console.log('🩸QuizResults: Received results:', results);

  // Handle cases where results might not be properly passed
  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <StatusBar style="dark" translucent={true} /> */}
        <View style={styles.content}>
          <Text style={styles.errorText}>No results available</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('index')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { score, total, percentage } = results;

  // Determine message based on score
  let message = '';
  let messageColor = '';

  if (percentage >= 90) {
    message = 'Excellent! You genuis!';
    messageColor = '#4caf50';
  } else if (percentage >= 60) {
    message = 'Not bad!';
    messageColor = '#2196f3';
  } else if (percentage >= 40) {
    message = 'Keep practicing!';
    messageColor = '#ff9800';
  } else {
    message = 'You dumb motherfucker!';
    messageColor = '#f44336';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" translucent={true} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('index')}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#555" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.content}>
        <View style={styles.resultCircle}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <Text style={[styles.messageText, { color: messageColor }]}>
          {message}
        </Text>

        <Text style={styles.scoreText}>
          You scored {score} out of {total}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            // onPress={() => navigation.navigate('index')}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.buttonText}>New Quiz</Text>
          </TouchableOpacity>

          {/* You can add more buttons here like "Review Answers" if needed */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: 'red',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // backgroundColor: 'teal',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 10,
    borderColor: '#e0e0e0',
  },
  percentageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 36,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 24,
  },
});

export default QuizResults;
