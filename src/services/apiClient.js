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

// Request Interceptor - Add token to every request
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
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('userData');
      // You can trigger logout action here if needed
    }
    return Promise.reject(error);
  },
);

export default apiClient;
