import apiClient from './apiClient';

// Simple Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  signup: (email, password, name) =>
    apiClient.post('/auth/signup', { email, password, name }),

  logout: () =>
    apiClient.post('/auth/logout'),
};

export default authAPI;
