import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Platform, Clipboard } from 'react-native';

const WordLimitedInput = ({
  value = '',
  onChange,
  wordLimit = 1000,
  placeholder = '',
  multiline = true,
  style = {},
  onWordCountChange = () => {},
  ...rest
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const inputRef = useRef(null);

  // Update word count whenever value changes
  useEffect(() => {
    const count = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    setWordCount(count);
    const limitReached = count >= wordLimit;
    setIsLimitReached(limitReached);

    // Notify parent component of changes
    onWordCountChange(count, limitReached);
  }, [value, wordLimit, onWordCountChange]);

  // Handle content change while respecting word limit
  const handleChange = (newText) => {
    // Process the text to respect the word limit
    const truncatedText = truncateToWordLimit(newText, wordLimit);

    // Update the state with the truncated text
    onChange(truncatedText);
  };

  // Helper function to handle paste (only used on Android)
  //   const handlePaste = async (selectionStart, selectionEnd) => {
  //     try {
  //       // Get clipboard content
  //       const pastedText = await Clipboard.getString();

  //       // Combine with existing text
  //       const currentText = value;
  //       const newText =
  //         currentText.substring(0, selectionStart) +
  //         pastedText +
  //         currentText.substring(selectionEnd);

  //       // Truncate to word limit and update
  //       const truncatedText = truncateToWordLimit(newText, wordLimit);

  //       // Update the state with the truncated text
  //       onChange(truncatedText);
  //     } catch (error) {
  //       console.error('Failed to paste text:', error);
  //     }
  //   };

  // Helper function to truncate text to word limit
  const truncateToWordLimit = (text, limit) => {
    if (!text || text.trim() === '') return '';

    const words = text.split(/\s+/);
    if (words.length <= limit) {
      return text;
    }

    // Join only the allowed number of words
    return words.slice(0, limit).join(' ');
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        multiline={multiline}
        style={[styles.input, style]}
        textAlignVertical="top"
        selectionColor="#2563eb"
        // React Native doesn't have a direct onPaste event
        // This is a workaround for Android if needed
        onSelectionChange={(event) => {
          // Store selection for potential paste operations
          const { start, end } = event.nativeEvent.selection;
          inputRef.current.selectionStart = start;
          inputRef.current.selectionEnd = end;
        }}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    width: '100%',
    minHeight: 250,
    maxHeight: 250,
    padding: 12,
    // backgroundColor: '#eff2fe',
    backgroundColor: '#e5ebfe',
    borderRadius: 8,
    color: '#4b5563',
    fontSize: 16,
    textAlignVertical: 'top',

    // ✅ Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    elevation: 1,
  },
});

export default WordLimitedInput;
