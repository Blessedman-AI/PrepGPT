import Constants from 'expo-constants';

/**
 * Extract text from a PDF file in React Native
 * @param {string} fileUri - The URI of the PDF file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { API_URL } from '../config/api';

// const API_URL = 'http://192.168.223.142:5000/api';
// const API_URL = Constants.expoConfig?.extra?.apiUrl;

export async function extractPdfText(fileUri) {
  try {
    // For React Native, we need to use a different approach since
    // pdfjs-dist doesn't work directly in React Native

    // Option 1: Use a server-side approach
    // Upload the PDF to your server and extract text there
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileUri.split('/').pop(),
      type: 'application/pdf',
    });

    // Send to your server endpoint that handles PDF extraction using axios
    try {
      const response = await axios.post(
        `${API_URL}/extract-text/pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Axios automatically throws for error status codes
      return response.data.text || '';
    } catch (axiosError) {
      throw new Error(
        `Server error: ${axiosError.response?.status || 'Unknown'} - ${
          axiosError.message
        }`
      );
    }

    // Option 2: If you want to process PDFs directly on the device
    // You would need to use a native module like react-native-pdf-lib
    // Example implementation would be different and require additional setup

    // Note: For a complete solution, you might want to implement both approaches
    // and fall back to the server if the local processing fails
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

/**
 * Alternative implementation using react-native-pdf-lib
 * Requires: npm install react-native-pdf-lib
 */
/*
import PDFLib from 'react-native-pdf-lib';

export async function extractPdfTextLocal(fileUri) {
  try {
    // This is a conceptual example - the actual implementation would depend
    // on the specific capabilities of the PDF library you choose
    const extractedText = await PDFLib.extractText(fileUri);
    return extractedText;
  } catch (error) {
    console.error('Error extracting PDF text locally:', error);
    throw new Error('Failed to extract text from PDF locally');
  }
}
*/
