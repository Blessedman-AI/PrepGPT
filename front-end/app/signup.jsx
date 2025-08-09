import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import RegisterScreen from '../components/register/RegisterScreen';

const signUp = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RegisterScreen />
    </View>
  );
};

export default signUp;

const styles = StyleSheet.create({});
