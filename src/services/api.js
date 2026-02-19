import apiClient from './apiClient';

// Auth API Endpoints
export const authAPI = {
  // Login endpoint
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  // Register endpoint
  register: (userData) =>
    apiClient.post('/auth/register', userData),

  // Logout endpoint (optional)
  logout: () =>
    apiClient.post('/auth/logout'),

  // Verify token endpoint
  verifyToken: () =>
    apiClient.get('/auth/verify'),

  // Get user profile
  getUserProfile: () =>
    apiClient.get('/auth/profile'),

  // Update profile
  updateProfile: (userData) =>
    apiClient.put('/auth/profile', userData),
};

// User API Endpoints
export const userAPI = {
  // Get all users (example)
  getAllUsers: () =>
    apiClient.get('/users'),

  // Get user by ID
  getUserById: (userId) =>
    apiClient.get(`/users/${userId}`),

  // Update user
  updateUser: (userId, userData) =>
    apiClient.put(`/users/${userId}`, userData),

  // Delete user
  deleteUser: (userId) =>
    apiClient.delete(`/users/${userId}`),
};

// Add more API endpoints as needed
// Example: Posts, Comments, etc.
export const postsAPI = {
  getAllPosts: () =>
    apiClient.get('/posts'),

  getPostById: (postId) =>
    apiClient.get(`/posts/${postId}`),

  createPost: (postData) =>
    apiClient.post('/posts', postData),

  updatePost: (postId, postData) =>
    apiClient.put(`/posts/${postId}`, postData),

  deletePost: (postId) =>
    apiClient.delete(`/posts/${postId}`),
};

export default {
  authAPI,
  userAPI,
  postsAPI,
};
