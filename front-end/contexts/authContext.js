import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import Constants from 'expo-constants';
import axiosInstance from '../utils/axiosInstance';
import { API_URL } from '../config/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isLoading: false,
        isAuthenticated: !!action.token,
      };
    case 'SIGN_IN':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Secure token storage using Keychain
  const storeToken = async (token, user, refreshToken) => {
    try {
      // console.log('📦 Storing tokens...', {
      //   hasToken: !!token,
      //   hasRefreshToken: !!refreshToken,
      //   hasUser: !!user,
      // });
      await Keychain.setInternetCredentials('auth_token', 'user', token);
      await Keychain.setInternetCredentials(
        'refresh_token',
        'user',
        refreshToken
      );
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      console.log('✅ Tokens stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const getStoredToken = async () => {
    try {
      const credentials = await Keychain.getInternetCredentials('auth_token');
      const refreshCredentials = await Keychain.getInternetCredentials(
        'refresh_token'
      );
      const userData = await AsyncStorage.getItem('user_data');

      // console.log('🔍 Retrieved stored data:', {
      //   hasAccessToken: !!credentials,
      //   hasRefreshToken: !!refreshCredentials,
      //   hasUserData: !!userData,
      // });

      if (credentials && refreshCredentials && userData) {
        return {
          token: credentials.password,
          refreshToken: refreshCredentials.password,
          user: JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const removeStoredToken = async () => {
    try {
      await Keychain.resetInternetCredentials({ server: 'auth_token' });
      await Keychain.resetInternetCredentials({ server: 'refresh_token' });
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const stored = await getStoredToken();
      if (!stored?.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Attempting to refresh token...');
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: stored.refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      await storeToken(token, stored.user, newRefreshToken);

      // Update state
      dispatch({
        type: 'RESTORE_TOKEN',
        token: token,
        user: stored.user,
      });

      console.log('Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await signOut();
      throw error;
      // throw new Error('Session expired. Please log in again.');
    }
  };

  // Add this temporary function to your AuthContext for debugging
  const clearAllData = async () => {
    try {
      await removeStoredToken();
      dispatch({ type: 'SIGN_OUT' });
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      const stored = await getStoredToken();
      if (stored && !isTokenExpired(stored.token)) {
        dispatch({
          type: 'RESTORE_TOKEN',
          token: stored.token,
          user: stored.user,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    const fullUrl = endpoint.startsWith('http')
      ? endpoint
      : `${API_URL}${endpoint}`;

    // For authenticated users, handle token refresh logic
    if (state.user && state.token) {
      let token = state.token;

      // Check if current token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, attempting refresh...');
        try {
          token = await refreshToken();
        } catch (error) {
          throw error; // This will trigger sign out in refreshToken function
        }
      }

      try {
        const response = await axios({
          url: fullUrl,
          method: options.method || 'get',
          data: options.data,
          params: options.params,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (error) {
        console.error('❌API call error:', error.response.data);
        if (error.response && error.response.status === 401) {
          console.log('🤢Received 401, attempting token refresh...');
          try {
            // Try to refresh token once
            const newToken = await refreshToken();

            // Retry the original request with new token
            const retryResponse = await axios({
              url: fullUrl,
              method: options.method || 'get',
              data: options.data,
              params: options.params,
              headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            return retryResponse;
          } catch (refreshError) {
            throw refreshError;
          }
        }
        throw error;
      }
    } else {
      // For guest users (no authentication), make request without token
      console.log(
        '✅apiCall from authContext - Making guest API call (no authentication)'
      );
      try {
        const response = await axios({
          url: fullUrl,
          method: options.method || 'get',
          data: options.data,
          params: options.params,
          headers: {
            ...(options.headers || {}),
            'Content-Type': 'application/json',
            // No Authorization header for guests
          },
        });
        return response;
      } catch (error) {
        throw error;
      }
    }
  };

  const signIn = async (email, password) => {
    console.log('🏀authContext - Making request to:', API_URL);

    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      console.log('Making request to:', API_URL);

      console.log('📞📥 Sending login request to API...');
      const response = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });
      // console.log('📥📲 Login response:', response);

      const data = response.data;
      // console.log('📥 Login response data:', data);
      // console.log('📥 RefreshToken in response:', data.refreshToken);

      // Store both tokens
      await storeToken(data.token, data.user, data.refreshToken);

      dispatch({
        type: 'SIGN_IN',
        token: data.token,
        user: data.user,
      });

      // return { success: true };
      return { success: true, user: data.user };
    } catch (error) {
      console.error('🤮 authContext - Login error:', error.message, {
        // message: error.message,
        code: error.code,
      });
      dispatch({ type: 'SET_LOADING', isLoading: false });

      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    console.log('Form data received from signup component:📥📲', {
      email,
      password,
      name,
    });
    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });

      console.log('📞📥 Sending signup request to API...');
      const response = await axiosInstance.post(`/auth/signup`, {
        email,
        password,
        name,
      });

      const data = response.data;
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store both tokens
      await storeToken(data.token, data.user, data.refreshToken);
      dispatch({
        type: 'SIGN_IN',
        token: data.token,
        user: data.user,
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'Signup failed',
      };
    }
  };

  const signOut = async () => {
    await removeStoredToken();
    dispatch({ type: 'SIGN_OUT' });
  };

  const restoreToken = async () => {
    // console.log('🚀 App starting, checking for stored tokens...');
    try {
      const stored = await getStoredToken();
      console.log('🔍 Stored token check result:', {
        hasStored: !!stored,
        hasToken: stored?.token ? 'yes' : 'no',
        hasRefreshToken: stored?.refreshToken ? 'yes' : 'no',
        hasUser: stored?.user ? 'yes' : 'no',
      });

      if (stored && stored.token && stored.refreshToken) {
        if (!isTokenExpired(stored.token)) {
          // Token is still valid
          console.log('✅ Valid token found, user is authenticated');
          dispatch({
            type: 'RESTORE_TOKEN',
            token: stored.token,
            user: stored.user,
          });
        } else {
          // Token expired, try to refresh
          console.log('🔄 Token expired, attempting refresh...');
          try {
            await refreshToken();
          } catch (error) {
            console.log('❌ Refresh failed, clearing session');
            // Refresh failed, clear everything
            await removeStoredToken();
            dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
          }
        }
      } else {
        // No stored tokens found
        console.log('❌ No stored tokens found, user needs to sign in');
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    } catch (error) {
      console.error('Error restoring token:', error);
      dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
    }
  };

  useEffect(() => {
    restoreToken();
  }, []);

  const authContext = {
    ...state,
    signIn,
    signUp,
    signOut,
    apiCall,
    refreshUserData,
    refreshToken,
    clearAllData,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
