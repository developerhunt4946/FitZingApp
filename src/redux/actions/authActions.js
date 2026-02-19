import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REGISTER,
  AUTH_RESTORE_TOKEN,
  AUTH_LOADING,
  AUTH_ERROR,
  AUTH_CLEAR_ERROR,
} from './types';

// Action: Login User
export const loginUser = (userData) => (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  try {
    // Success - store user data
    dispatch({
      type: AUTH_LOGIN,
      payload: userData,
    });
    dispatch({ type: AUTH_CLEAR_ERROR });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.message || 'Login failed',
    });
  }
};

// Action: Register User
export const registerUser = (userData) => (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  try {
    // Success - store user data
    dispatch({
      type: AUTH_REGISTER,
      payload: userData,
    });
    dispatch({ type: AUTH_CLEAR_ERROR });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.message || 'Registration failed',
    });
  }
};

// Action: Logout User
export const logoutUser = () => (dispatch) => {
  dispatch({ type: AUTH_LOGOUT });
  dispatch({ type: AUTH_CLEAR_ERROR });
};

// Action: Restore Token (for persistent login)
export const restoreToken = (token, userData) => (dispatch) => {
  dispatch({
    type: AUTH_RESTORE_TOKEN,
    payload: { token, userData },
  });
};

// Action: Clear Auth Error
export const clearAuthError = () => (dispatch) => {
  dispatch({ type: AUTH_CLEAR_ERROR });
};
