import apiClient from './apiClient';

// Simple Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  signup: (payload) =>
    apiClient.post('/auth/signup', payload),

  logout: () =>
    apiClient.post('/auth/logout'),
};

export default authAPI;
