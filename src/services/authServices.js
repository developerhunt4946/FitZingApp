import authAPI from './api';

// Simple login service
export const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    console.log('Login response:', response.data); // Debugging log
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Simple signup service
export const signup = async (email, password, name) => {
  try {
    const response = await authAPI.signup(email, password, name);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Simple logout service
export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    throw error.response?.data || error;
  }
};
