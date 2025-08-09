import React from 'react';
import { TextInput, useColorScheme } from 'react-native';

const ThemedTextInput = ({
  style,
  placeholderTextColor,
  lightTextColor,
  darkTextColor,
  lightPlaceholderColor,
  darkPlaceholderColor,
  lightBackgroundColor,
  darkBackgroundColor,
  lightBorderColor,
  darkBorderColor,
  variant = 'default',
  ...props
}) => {
  const colorScheme = useColorScheme();

  // Define color variants for different input types
  const colorVariants = {
    default: {
      text: {
        light: '#777777',
        dark: '#333333',
      },
      placeholder: {
        light: '#999999',
        dark: '#666666',
      },
      background: {
        light: '#FFFFFF',
        dark: '#1C1C1E',
      },
      border: {
        light: '#E0E0E0',
        dark: '#3A3A3C',
      },
    },
    outlined: {
      text: {
        light: '#000000',
        dark: '#FFFFFF',
      },
      placeholder: {
        light: '#999999',
        dark: '#666666',
      },
      background: {
        light: 'transparent',
        dark: 'transparent',
      },
      border: {
        light: '#007AFF',
        dark: '#0A84FF',
      },
    },
    filled: {
      text: {
        light: '#000000',
        dark: '#FFFFFF',
      },
      placeholder: {
        light: '#666666',
        dark: '#999999',
      },
      background: {
        light: '#F2F2F7',
        dark: '#2C2C2E',
      },
      border: {
        light: 'transparent',
        dark: 'transparent',
      },
    },
  };

  // Get the appropriate colors
  const variantColors = colorVariants[variant] || colorVariants.default;

  const textColor =
    colorScheme === 'dark'
      ? darkTextColor || variantColors.text.dark
      : lightTextColor || variantColors.text.light;

  const placeholder =
    colorScheme === 'dark'
      ? darkPlaceholderColor || variantColors.placeholder.dark
      : lightPlaceholderColor || variantColors.placeholder.light;

  const backgroundColor =
    colorScheme === 'dark'
      ? darkBackgroundColor || variantColors.background.dark
      : lightBackgroundColor || variantColors.background.light;

  const borderColor =
    colorScheme === 'dark'
      ? darkBorderColor || variantColors.border.dark
      : lightBorderColor || variantColors.border.light;

  const themedStyle = {
    color: textColor,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: variantColors.border.light === 'transparent' ? 0 : 1,
  };

  return (
    <TextInput
      style={[themedStyle, style]}
      placeholderTextColor={placeholderTextColor || placeholder}
      {...props}
    />
  );
};

export default ThemedTextInput;
