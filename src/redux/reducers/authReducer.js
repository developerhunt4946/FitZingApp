import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REGISTER,
  AUTH_RESTORE_TOKEN,
  AUTH_LOADING,
  AUTH_ERROR,
  AUTH_CLEAR_ERROR,
} from '../actions/types';

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isSignout: false,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_LOGIN:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isSignout: false,
        error: null,
      };

    case AUTH_REGISTER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isSignout: false,
        error: null,
      };

    case AUTH_RESTORE_TOKEN:
      return {
        ...state,
        user: action.payload.userData,
        token: action.payload.token,
        isLoading: false,
        isSignout: false,
      };

    case AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isSignout: true,
        error: null,
      };

    case AUTH_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;
