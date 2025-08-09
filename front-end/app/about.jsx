import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

const about = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About page</Text>
      <Link href="/" style={styles.homeLink}>
        Home
      </Link>
    </View>
  );
};

export default about;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  homeLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 28,
    marginTop: 30,
  },
});
