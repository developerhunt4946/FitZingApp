import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, signup as signupService } from '../../services/authServices';
import { updateProfile as updateProfileService } from '../../services/userServices';

// Helper: persist auth data
const persistAuth = async (token, user) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to persist auth:', e);
  }
};

// Helper: clear auth data
const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  } catch (e) {
    console.warn('Failed to clear auth:', e);
  }
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginService(email, password);
      // Persist token and user to AsyncStorage
      const token = data?.data?.tokens?.accessToken;
      const user = data?.data?.user;
      if (token) {
        await persistAuth(token, user);
      }
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await signupService(payload);
      const token = data?.data?.tokens?.accessToken;
      const user = data?.data?.user;
      if (token) {
        await persistAuth(token, user);
      }
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message || 'Signup failed. Please try again.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await updateProfileService(payload);
      // The API might return the user object directly in data or data.user or data.data
      const updatedUser = data?.data || data?.user || data;

      if (updatedUser) {
        const token = await AsyncStorage.getItem('authToken');
        await persistAuth(token, updatedUser);
        return updatedUser;
      }
      return rejectWithValue('Invalid response from server');
    } catch (error) {
      return rejectWithValue(error.message || 'Update failed. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Used by RootNavigator to restore session from AsyncStorage
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      clearAuth();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Merge updated fields into the existing user object to preserve other fields like email/ids
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setToken, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
