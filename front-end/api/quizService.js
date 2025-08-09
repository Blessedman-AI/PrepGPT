import Constants from 'expo-constants';
import axios from 'axios';

/**
 * Generates quiz questions based on provided content
 * @param {string} textContent - The content to generate questions from
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} inputTab - Source type ('prompt' or 'document')
 * @returns {Promise<Array>} - Array of generated questions
 */

// const API_URL = 'http://192.168.223.142:5000/api';
const API_URL = Constants.expoConfig?.extra?.apiUrl;
// console.log('API_URL:🩸', API_URL);

export const generateQuestions = async (
  textContent,
  numQuestions,
  inputTab
) => {
  if (!textContent.trim()) {
    throw new Error('Please enter a prompt or upload a document');
  }

  console.log('Sending data 🩸', textContent, numQuestions, inputTab);

  try {
    const response = await axios.post(`${API_URL}/generate-quiz`, {
      content: textContent,
      numQuestions,
      source: inputTab,
    });

    const result = response.data.result;
    // console.log('Response from server:', result);

    // Ensure we have the questions array
    let parsedQuestions = [];
    if (result.questions) {
      parsedQuestions = result.questions;
    } else if (Array.isArray(result)) {
      parsedQuestions = result;
    } else {
      throw new Error('Invalid question format returned from API');
    }

    // console.log('Parsed questions:', parsedQuestions);
    return parsedQuestions;
  } catch (err) {
    console.error('Full error object:', err);

    // Provide a user-friendly error message
    if (err.message.includes('Network Error') || !err.response) {
      throw new Error('Cannot connect');
    } else {
      throw new Error(err.response?.data?.error || err.message);
    }
  }
};
