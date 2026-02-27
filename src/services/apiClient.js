import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '@env';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL || 'https://api.example.com',
  timeout: parseInt(API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add token + log full URL
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }

    // // 🔍 DEBUG: log full request URL, method, and body
    // const fullURL = (config.baseURL || '') + (config.url || '');
    // console.log('=== API REQUEST ===');
    // console.log('URL    :', fullURL);
    // console.log('Method :', config.method?.toUpperCase());
    // console.log('Body   :', JSON.stringify(config.data));
    // console.log('==================');

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔍 DEBUG: log what the server replied with
    console.log('=== API ERROR ===');
    console.log('Status :', error.response?.status);
    console.log('Data   :', JSON.stringify(error.response?.data));
    console.log('=================');

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
