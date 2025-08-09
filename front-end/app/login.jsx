import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LoginScreen from '../components/login/LoginScreen';

const login = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LoginScreen />
    </View>
  );
};

export default login;

// const styles = StyleSheet.create({});
