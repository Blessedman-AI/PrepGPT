import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import PaywallScreen from '../components/premium/PaywallScreen';

const Paywall = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'teal', // Dark background for paywall
      }}
    >
      <PaywallScreen />
      {/* <Text>paywall screen</Text> */}
    </View>
  );
};

export default Paywall;
