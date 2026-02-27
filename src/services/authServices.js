import authAPI from './api';

// Login service
export const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Signup service — accepts full form payload
export const signup = async (payload) => {
  try {
    const response = await authAPI.signup(payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout service
export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    throw error.response?.data || error;
  }
};
