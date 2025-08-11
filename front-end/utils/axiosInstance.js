import axios from 'axios';
import Constants from 'expo-constants';
import { API_URL } from '../config/api';

console.log('❌axiosInstance - Using API URL:', API_URL);
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default axiosInstance;
