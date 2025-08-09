import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  //   SafeAreaView,
  //   StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const QuizDisplay = ({ route }) => {
  const { questions, onComplete } = route.params;
  const navigation = useNavigation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionSubmitted, setQuestionSubmitted] = useState({});

  const router = useRouter();

  useEffect(() => {
    // Initialize selected answers for multi-choice questions as arrays
    const initialAnswers = {};
    questions.forEach((question, index) => {
      if (question.type === 'multi-choice') {
        initialAnswers[index] = [];
      } else {
        initialAnswers[index] = '';
      }
    });
    setSelectedAnswers(initialAnswers);
  }, [questions]);

  const handleAnswerSelect = (index, answer) => {
    if (questionSubmitted[index]) return;

    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === 'multi-choice') {
      setSelectedAnswers((prev) => {
        const current = [...prev[index]];
        const answerIndex = current.indexOf(answer);

        if (answerIndex === -1) {
          current.push(answer);
        } else {
          current.splice(answerIndex, 1);
        }

        return { ...prev, [index]: current };
      });
    } else {
      // Single choice
      setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const calculateResults = () => {
    let score = 0;

    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      const correctAnswer = question.correctAnswer;

      if (question.type === 'multi-choice') {
        // For multi-choice, check if arrays match (regardless of order)
        if (
          userAnswer &&
          correctAnswer &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((answer) => correctAnswer.includes(answer))
        ) {
          score++;
        }
      } else {
        // For single-choice
        if (userAnswer === correctAnswer) {
          score++;
        }
      }
    });

    const percentage = Math.round((score / questions.length) * 100);
    return { score, total: questions.length, percentage };
  };

  const handleSubmitQuestion = () => {
    setQuestionSubmitted((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const results = calculateResults();

    // Navigate to the results screen with the results
    // navigation.navigate('QuizResults', { results });
    console.log('pushing to quiz results with:', results);
    router.push({
      pathname: '/quiz-results',
      params: { results: JSON.stringify(results) },
    });

    // If onComplete was passed as a param, call it
    if (onComplete) {
      onComplete(results);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No questions available</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionSubmitted = questionSubmitted[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion?.options?.map((option, optionIndex) => {
              const isSelected =
                currentQuestion.type === 'multi-choice'
                  ? selectedAnswers[currentQuestionIndex]?.includes(option)
                  : selectedAnswers[currentQuestionIndex] === option;

              const isCorrect =
                currentQuestion?.type === 'multi-choice'
                  ? currentQuestion?.correctAnswer.includes(option)
                  : currentQuestion?.correctAnswer === option;

              let optionStyle = [styles.option];
              let checkboxStyle = [
                currentQuestion.type === 'multi-choice'
                  ? styles.checkbox
                  : styles.radio,
              ];
              let innerCheckStyle = [];

              if (isSelected && !isCurrentQuestionSubmitted) {
                optionStyle.push(styles.selectedOption);
                checkboxStyle.push(styles.selectedCheckbox);
              }

              if (isCurrentQuestionSubmitted) {
                if (isCorrect) {
                  optionStyle.push(styles.correctOption);
                  checkboxStyle.push(styles.correctCheckbox);
                } else if (isSelected && !isCorrect) {
                  optionStyle.push(styles.incorrectOption);
                  checkboxStyle.push(styles.incorrectCheckbox);
                }
              }

              if (isSelected) {
                innerCheckStyle =
                  isCurrentQuestionSubmitted && isCorrect
                    ? styles.correctInnerCheck
                    : isCurrentQuestionSubmitted && !isCorrect
                    ? styles.incorrectInnerCheck
                    : styles.selectedInnerCheck;
              }

              return (
                <TouchableOpacity
                  key={optionIndex}
                  style={optionStyle}
                  onPress={() =>
                    handleAnswerSelect(currentQuestionIndex, option)
                  }
                  disabled={isCurrentQuestionSubmitted}
                >
                  <View style={checkboxStyle}>
                    {isSelected && <View style={innerCheckStyle} />}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={[
              styles.navigationButton,
              currentQuestionIndex === 0 && styles.disabledButton,
            ]}
          >
            <Text
              style={[
                styles.navigationButtonText,
                currentQuestionIndex === 0 && styles.disabledButtonText,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {!isCurrentQuestionSubmitted ? (
            <TouchableOpacity
              onPress={handleSubmitQuestion}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity onPress={handleNext} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    // backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 44,
    // backgroundColor: 'red',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },

  questionContainer: {
    marginBottom: 30,
  },

  questionText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 26,
    marginBottom: 44,
    // backgroundColor: 'teal',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  incorrectOption: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedCheckbox: {
    borderColor: '#2196f3',
  },
  correctCheckbox: {
    borderColor: '#4caf50',
  },
  incorrectCheckbox: {
    borderColor: '#f44336',
  },
  selectedInnerCheck: {
    width: 12,
    height: 12,
    backgroundColor: '#2196f3',
    borderRadius: 2,
  },
  correctInnerCheck: {
    width: 12,
    height: 12,
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  incorrectInnerCheck: {
    width: 12,
    height: 12,
    backgroundColor: '#f44336',
    borderRadius: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navigationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navigationButtonText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#aaa',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default QuizDisplay;
