import React, { useState } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/authContext';
import { API_URL } from '../../config/api';

// const API_URL = Constants.expoConfig?.extra?.apiUrl;

const ResetUsageScreen = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(null);
  const { user } = useAuth();
  const userId = user?.id;
  // console.log('ResetUsageScreen userId:', userId);

  const resetPromptUsage = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is required');
      return;
    }

    setIsResetting(true);

    try {
      const response = await axios.post(
        `${API_URL}/reset/usage/${userId}`,
        {}, // Empty body for POST request
        {
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if you're using authentication
            // 'Authorization': `Bearer ${yourAuthToken}`
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const data = response.data;

      if (data.success) {
        setLastResetTime(new Date().toLocaleTimeString());

        Alert.alert(
          'Success! ✅',
          `Usage reset successfully!\nPrompts left: ${data.promptsLeft}`,
          [{ text: 'OK' }]
        );
      } else {
        // console.error('🅰️Reset failed:', data);
        // Alert.alert('Reset Failed ❌', data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('📥Reset error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          Alert.alert(
            'Timeout ⏰',
            'Request timed out. Check your connection.'
          );
        } else if (error.response) {
          // Server responded with error status
          const errorMsg =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            'Server error';
          Alert.alert('Server Error ❌', errorMsg);
          console.error('📥Reset error response:', errorMsg);
        } else if (error?.request) {
          // Network error
          Alert.alert(
            'Network Error ❌',
            'Failed to connect to server. Make sure your backend is running.'
          );
          console.error('📥Reset error request:', error?.request);
        } else {
          Alert.alert('Error ❌', error.message);
          console.error('📥Reset error message:', error?.message);
        }
      } else {
        Alert.alert('Unknown Error ❌', 'Something went wrong');
        console.error('📥Reset unknown error:', error);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Development Tools</Text>

      <TouchableOpacity
        style={[styles.button, isResetting && styles.buttonDisabled]}
        onPress={resetPromptUsage}
        disabled={isResetting}
        activeOpacity={0.7}
      >
        {isResetting ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.buttonText}>Resetting...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>🔄 Reset Prompt Usage</Text>
        )}
      </TouchableOpacity>

      {lastResetTime && (
        <Text style={styles.lastResetText}>Last reset: {lastResetTime}</Text>
      )}

      <Text style={styles.userId}>User ID: {userId || 'Not set'}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  lastResetText: {
    marginTop: 10,
    fontSize: 12,
    color: '#28a745',
    fontStyle: 'italic',
  },
  userId: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
  },
});

export default ResetUsageScreen;
