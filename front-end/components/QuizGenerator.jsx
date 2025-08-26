import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  // SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'expo-router';

import DocumentUploadDisplay from './DocumentUploadDisplay';
import WordLimitedInput from './WordLimitedInput';

import { useUsage } from '../hooks/useUsage';
import ThemedText from '../Themes/ThemedText';

import { useAuth } from '../contexts/authContext';
import getErrorMessage from '../utils/errorHandler';

const QuizGenerator = () => {
  const [numQuestionsText, setNumQuestionsText] = useState('3');
  const [numQuestions, setNumQuestions] = useState(1);
  const [inputTab, setInputTab] = useState('prompt');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const wordLimit = 1000;

  const router = useRouter();

  const { apiCall, user, isAuthenticated } = useAuth();
  // console.log('🩸👤 User from QuizGenerator: ', user);
  // console.log('✅🤡 isAuthenticated ', isAuthenticated);

  const {
    usageStats,
    usageLoading,
    fetchUsageStats,
    canUsePrompt,
    usePrompt,
    generateQuiz,
    // Helper values
    isPremium,
    canUse,
    remainingPrompts,
    dailyLimit,
  } = useUsage();

  // console.log('✅hook info', remainingPrompts, dailyLimit);

  /////////////////////////////////////
  //////////////////////////
  const getIsDisabled = (num) => {
    if (!user && num > 1) return true;
    if (user && !isPremium && num > 3) return true;
    return false;
  };

  const getDisabledLabel = () => {
    if (!user) return 'Login required';
    if (user && !isPremium) return 'Premium required';
    return '';
  };
  ////////////////////////////
  /////////////////////

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Automatically clear the error after 3 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timeout); // Clean up
    }
  }, [error]);

  const handleRefresh = async () => {
    if (!isExpanded) {
      setRefreshing(true);
      await fetchUsageStats(); // Add this line
      setRefreshing(false); // Add this line
    } else {
      return null;
    }
  };

  // Handler for word count updates
  const handleWordCountChange = (count, limitReached) => {
    setWordCount(count);
    setIsLimitReached(limitReached);
  };

  const handleTextChange = (text) => {
    // Always update the text value
    setNumQuestionsText(text);

    if (text === '') {
      setNumQuestions(null);
      return;
    }

    // Convert to number and validate
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setNumQuestions(num);
    }
  };

  const handleGenerateQuestions = async (textContent) => {
    // Early return if no content - this stops execution immediately
    if (!textContent || textContent.trim() === '') {
      // console.log('❌ Validation failed - setting error and returning');
      setError('Please enter a prompt or upload a document');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsedQuestions = await generateQuiz(
        textContent,
        numQuestions,
        inputTab
      );

      setQuestions(parsedQuestions);
      // Add this navigation code after successful quiz generation
      if (parsedQuestions && parsedQuestions.length > 0) {
        // This is the key part - navigate to the quiz display screen
        router.push({
          pathname: '/quiz-display',
          params: { questions: JSON.stringify(parsedQuestions) },
        });
      } else {
        throw new Error('No questions were generated');
      }
      // setShowQuiz(true);
    } catch (err) {
      console.error('🔴 Axios error response:', err.response.data.message);
      const errorMessage = getErrorMessage(err);
      console.error('🗝️📞Error generating questions:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    handleGenerateQuestions(content);
    console.log('handle submit called with content:', content);
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setShowQuiz(false);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const handleCreateNewQuiz = () => {
    setQuestions(null);
    setQuizResult(null);
    setContent('');
    setFileName('');
  };

  // useEffect(() => {
  //   if (isAuthenticated && usageLoading) {
  //     setIsLoading(true);
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [usageLoading]);

  const renderQuizGenerator = () => (
    <>
      <View style={[styles.optionsRow]}>
        {/* Input Tab Buttons */}
        <View style={[styles.tabContainer]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              inputTab === 'prompt' && styles.activeTab,
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
            ]}
            onPress={() => setInputTab('prompt')}
          >
            <Text
              style={[
                styles.tabButtonText,
                inputTab === 'prompt' && styles.activeTabText,
              ]}
            >
              Prompt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              inputTab === 'document' && styles.activeTab,
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
            ]}
            onPress={() => setInputTab('document')}
          >
            <Text
              style={[
                styles.tabButtonText,
                inputTab === 'document' && styles.activeTabText,
              ]}
            >
              Document
            </Text>
          </TouchableOpacity>
        </View>

        {/* Number of Questions */}
        {/* {user && (
          <View style={[styles.questionsContainer]}>
            <Text style={styles.questionLabel}>Questions</Text>
            <TextInput
              style={styles.questionInput}
              value={numQuestions?.toString()}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        )} */}
        <View style={[styles.questionsContainer]}>
          <Text style={styles.questionLabel}>Questions</Text>

          {/* Dropdown Header */}
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.dropdownHeaderText}>
              {numQuestions} question{numQuestions > 1 ? 's' : ''}
            </Text>
            <Text
              style={[
                styles.dropdownArrow,
                isExpanded && styles.dropdownArrowUp,
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>

          {/* Expandable Options */}
          {isExpanded && (
            <View style={styles.dropdownOptions}>
              <ScrollView style={styles.optionsScrollView} nestedScrollEnabled>
                {Array.from({ length: 15 }, (_, i) => {
                  const num = i + 1;
                  const isDisabled = getIsDisabled(num);
                  const isSelected = numQuestions === num;

                  return (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.dropdownOption,
                        isDisabled && styles.dropdownOptionDisabled,
                        isSelected && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => {
                        if (!isDisabled) {
                          setNumQuestions(num);
                          setIsExpanded(false);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          isDisabled && styles.dropdownOptionTextDisabled,
                          isSelected && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {num} question{num > 1 ? 's' : ''}
                      </Text>
                      {isDisabled && (
                        <Text style={styles.disabledLabel}>
                          {getDisabledLabel()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Input Card */}
      <View style={styles.inputContainer}>
        {inputTab === 'prompt' ? (
          <WordLimitedInput
            value={content}
            onChangeText={setContent}
            placeholder="Enter a prompt..."
            wordLimit={wordLimit}
            onWordCountChange={handleWordCountChange}
          />
        ) : (
          <DocumentUploadDisplay
            fileName={fileName}
            content={content}
            onContentChange={setContent}
            onFileNameChange={setFileName}
            wordLimit={wordLimit}
            wordCount={wordCount}
            isLimitReached={isLimitReached}
            onWordCountChange={handleWordCountChange}
            onAutoGenerate={(textContent) =>
              handleGenerateQuestions(textContent)
            }
          />
        )}
      </View>

      {/* Error message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {/* Word Count and Generate Button */}
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.wordCount,
                isLimitReached && styles.wordCountLimit,
              ]}
            >
              {wordCount} / {wordLimit} words
              {isLimitReached ? ' (limit reached)' : ''}
            </Text>
            <TouchableOpacity
              style={[
                styles.generateButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={() => {
                handleSubmit();
                Keyboard.dismiss();
              }}
              disabled={isLoading}
            >
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );

  const renderQuizResults = () => {
    if (!quizResult) return null;

    const { score, total, percentage } = quizResult;
    // console.log('Quiz Results:', quizResult);

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeader}>Quiz Results</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.totalText}>/ {total}</Text>
          </View>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateNewQuiz}
          >
            <Text style={styles.primaryButtonText}>Create New Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setQuizResult(null)}
          >
            <Text style={styles.secondaryButtonText}>Back to Generator</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PrepGPT</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            // contentContainerStyle={[
            //   styles.scrollContent,
            //   keyboardVisible
            //     ? styles.keyboardVisibleScrollContent
            //     : styles.centeredScrollContent,
            // ]}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                enabled={!isExpanded}
              />
            }
          >
            {/* Usage Information Display */}
            <View style={{ marginBottom: 8 }}>
              {isPremium ? (
                <Text style={styles.premiumText}>
                  ✨ Premium - Unlimited Quizzes
                </Text>
              ) : (
                user && (
                  <ThemedText variant="muted">
                    Daily Quizzes Remaining: {remainingPrompts}/3
                  </ThemedText>
                )
              )}
            </View>
            {/* Warning when running low */}
            {/* {!isPremium && remainingPrompts <= 2 && remainingPrompts > 0 && (
              <View style={styles.warningContainer}>
                <ThemedText variant="muted" style={styles.warningText}>
                  ⚠️ Only {remainingPrompts} quiz
                  {remainingPrompts === 1 ? '' : 'es'} left today!
                </ThemedText>
              </View>
            )} */}
            {/* Main Content */}
            {quizResult ? renderQuizResults() : renderQuizGenerator()}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default QuizGenerator;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'start',
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  keyboardVisibleScrollContent: {
    paddingTop: 80, // Add padding to the top when keyboard is visible
  },
  centeredContainer: {
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50, // Extra padding at bottom to ensure content doesn't get hidden behind keyboard
  },
  centeredScrollContent: {
    minHeight: '100%',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    minWidth: '100%',
  },

  usageInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  premiumText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  usageText: {
    textAlign: 'center',
    fontSize: 16,
  },

  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
  },

  upgradePrompt: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  upgradeText: {
    textAlign: 'center',
    marginBottom: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    borderColor: '#e5e5e5',
    minWidth: '70%',
    alignItems: 'flex-end',
  },
  tabButton: {
    height: 50,
    backgroundColor: '#DCDCDC',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563eb', // blue-600
  },
  tabButtonText: {
    fontWeight: '600',
    color: '#4b5563', // gray-700
  },
  activeTabText: {
    color: '#ffffff',
  },

  requirementText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 2,
    fontStyle: 'italic',
  },

  questionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  /////////////////////////////
  //////////////////////
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionsScrollView: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionDisabled: {
    backgroundColor: '#f8f8f8',
    opacity: 0.6,
  },
  dropdownOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptionTextDisabled: {
    color: '#999',
  },
  dropdownOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  disabledLabel: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 2,
    fontStyle: 'italic',
  },

  ///////////////////
  questionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563', // gray-700
    marginBottom: 4,
  },
  questionInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444', // red-500
    textAlign: 'center',
    marginVertical: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  wordCount: {
    color: '#6b7280', // gray-500
  },
  wordCountLimit: {
    color: '#b91c1c', // red-700
  },
  generateButton: {
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#93c5fd', // blue-400
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2563eb', // blue-500
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb', // blue-500
  },
  totalText: {
    fontSize: 18,
    color: '#6b7280', // gray-500
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb', // gray-200
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: '#4b5563', // gray-800
    fontWeight: '500',
  },
});
