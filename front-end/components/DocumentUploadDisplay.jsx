import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FileUploader from '../utils/FileUploader';

const DocumentUploadDisplay = ({
  fileName,
  content,
  onContentChange,
  onFileNameChange,
  wordLimit,
  wordCount,
  isLimitReached,
  onWordCountChange,
  onAutoGenerate,
}) => {
  // Get file upload utility functions
  const {
    handleFileUpload,
    resetFile,
    isDragging,
    isExtracting,
    isUploading,
    error,
  } = FileUploader({
    onContentChange,
    onFileNameChange,
    wordLimit,
    onWordCountChange,
    onAutoGenerate,
  });

  // Debug logging
  // console.log('DocumentUploadDisplay state:', {
  //   fileName,
  //   contentLength: content?.length || 0,
  //   wordCount,
  //   isExtracting,
  //   isUploading,
  //   error,
  //   hasContent: !!content && content.trim().length > 0,
  // });

  // console.log('State values:', { isExtracting, isUploading });

  // Function to handle manual text changes with word limit
  const handleTextChange = (text) => {
    console.log('Manual text change:', text.length, 'characters');

    const newText = text;
    const words = newText.trim().split(/\s+/);
    const count = words.length;

    onWordCountChange(count, count > wordLimit);

    if (count > wordLimit) {
      // If already over limit, don't allow more text
      if (newText.length > content.length) {
        return;
      }
    }

    onContentChange(newText);
  };

  if (fileName) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.fileInfoContainer}>
            <MaterialIcons
              name="description"
              size={24}
              color="#4285F4"
              style={styles.fileIcon}
            />
            <Text
              style={styles.fileName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {fileName}
            </Text>
          </View>

          {isExtracting || isUploading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading document...</Text>
              <ActivityIndicator size="large" color="#4285F4" />
            </View>
          ) : (
            <TextInput
              value={content}
              onChangeText={handleTextChange}
              style={styles.textInput}
              multiline={true}
              placeholder="Extracted content appears here. You can edit if needed."
              placeholderTextColor="#888"
            />
          )}

          {!isExtracting && !isUploading && (
            <TouchableOpacity onPress={resetFile} style={styles.linkButton}>
              <Text style={styles.linkText}>Upload a different file</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDragging && styles.draggingContainer]}>
      <MaterialIcons
        name="cloud-upload"
        size={48}
        color="#888"
        style={styles.uploadIcon}
      />
      <Text style={styles.uploadTitle}>Select a document to upload</Text>
      <TouchableOpacity style={styles.browseButton} onPress={handleFileUpload}>
        <Text style={styles.browseButtonText}>Browse Files</Text>
      </TouchableOpacity>
      <Text style={styles.supportedFormats}>
        Supported formats: PDF, DOCX, TXT
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5ebfe',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,

    // ✅ Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    elevation: 1,
  },

  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
    justifyContent: 'center',
  },
  fileIcon: {
    marginRight: 8,
  },
  fileName: {
    color: '#333',
    fontSize: 16,
    maxWidth: '80%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    minHeight: 150,
    maxHeight: 150,
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    color: '#4285F4',
    fontSize: 14,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  browseButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  supportedFormats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 12,
    fontSize: 14,
  },
});

export default DocumentUploadDisplay;
