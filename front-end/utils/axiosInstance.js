import axios from 'axios';
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl;
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default axiosInstance;
