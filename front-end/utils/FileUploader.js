import Constants from 'expo-constants';
import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const API_URL = Constants.expoConfig?.extra?.apiUrl;
// console.log('API_URL:🩸', API_URL);

const FileUploader = ({
  onContentChange,
  onFileNameChange,
  wordLimit,
  onWordCountChange,
  onAutoGenerate,
}) => {
  const [isDragging, setIsDragging] = useState(false); // Kept for state compatibility
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Process text to respect word limit
  const processTextWithWordLimit = (text) => {
    if (!text) return '';

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    // Update word count
    onWordCountChange(wordCount, wordCount > wordLimit);

    // If text exceeds word limit, truncate it
    if (wordCount > wordLimit) {
      return words.slice(0, wordLimit).join(' ');
    }

    return text;
  };

  // Handle file upload using expo-document-picker
  const handleFileUpload = async () => {
    try {
      setIsExtracting(true);
      setError('');

      // Use Expo's document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('File selection cancelled');
        setIsExtracting(false);
        return;
      }

      const file = result.assets[0];
      console.log('File selected:', file.name, file.mimeType);

      // Set filename immediately
      onFileNameChange(file.name);
      console.log('extracting?🩸', isExtracting);

      let extractedText = '';
      const fileUri = file.uri;
      const fileType = file.mimeType;
      const fileName = file.name;

      console.log('Processing file type:', fileType);

      // // Handle different file types
      if (fileType === 'application/pdf') {
        console.log('Extracting PDF text...');
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
        console.log('Uploading PDF to server:', fileName, fileType);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        const uploadResponse = await axios.post(
          `${API_URL}/extract-text/pdf`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          }
        );

        if (uploadResponse.data && uploadResponse.data.text) {
          extractedText = uploadResponse.data.text;
        } else {
          throw new Error('Invalid response from server');
        }
      } else if (fileType.includes('text/')) {
        // For text files, read using FileSystem
        extractedText = await FileSystem.readAsStringAsync(fileUri);
      } else if (
        fileType.includes(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) ||
        fileType.includes('application/msword')
      ) {
        // For DOCX, DOC - use server processing
        setIsUploading(true);
        console.log('Uploading document to server:', fileName, fileType);

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });

        // Upload file to get its text content
        const uploadResponse = await axios.post(
          `${API_URL}/extract-text/document`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout
          }
        );

        console.log('Server response status:', uploadResponse.status);
        console.log('Server response data:', uploadResponse.data);

        // Check if the response has the text field
        if (uploadResponse.data && uploadResponse.data.text) {
          extractedText = uploadResponse.data.text;
        } else {
          throw new Error(
            'Invalid response from server: ' +
              JSON.stringify(uploadResponse.data)
          );
        }
      } else {
        throw new Error('Unsupported file format: ' + fileType);
      }

      // if (fileType.includes('text/')) {
      //   setIsUploading(true);
      //   extractedText = await FileSystem.readAsStringAsync(fileUri);
      // }
      setIsUploading(false);

      console.log('Raw extracted text length:', extractedText.length);
      console.log('First 100 chars:', extractedText.substring(0, 100));

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      // Check if raw extracted text exceeds word limit BEFORE truncating
      const originalWords = extractedText.trim().split(/\s+/);
      const originalWordCount = originalWords.length;
      const limitReached = originalWordCount > wordLimit;

      console.log('Original word count:', originalWordCount);
      console.log('Word limit:', wordLimit);
      console.log('Limit reached:', limitReached);

      // Process text with word limit (truncate if needed)
      const processedText = processTextWithWordLimit(extractedText);
      console.log('Processed text length:', processedText.length);
      console.log('Setting content to parent...');

      // Update content in parent component
      onContentChange(processedText);

      // Small delay to ensure state updates propagate
      setTimeout(() => {
        // Auto-generate quiz only if word limit wasn't reached and we have content
        if (!limitReached && processedText.trim()) {
          // console.log('Auto-generating quiz with processed text...');
          onAutoGenerate(processedText);
        } else if (limitReached) {
          console.log('Word limit reached, not auto-generating');
        } else {
          console.log('No content to auto-generate from');
        }
      }, 100);
    } catch (err) {
      console.error('Error processing file:', err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 500) {
          setError('Unable to process document. Please try again.');
        } else {
          setError(err.response?.data?.error || 'Failed to process document');
        }
      } else {
        setError(err.message || 'Failed to process document');
      }

      // Reset states on error
      onContentChange('');
      onFileNameChange('');
      onWordCountChange(0, false);
    } finally {
      setIsExtracting(false);
      setIsUploading(false);
    }
  };

  // Reset content and filename
  const resetFile = () => {
    console.log('Resetting file...');
    onContentChange('');
    onFileNameChange('');
    onWordCountChange(0, false);
    setError('');
  };

  // We keep these methods for interface compatibility, but they're no-ops in React Native
  const handleDragEnter = useCallback(() => {}, []);
  const handleDragLeave = useCallback(() => {}, []);
  const handleDragOver = useCallback(() => {}, []);
  const handleDrop = useCallback(() => {}, []);

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileUpload,
    resetFile,
    isDragging,
    isExtracting,
    isUploading,
    error,
  };
};

export default FileUploader;
