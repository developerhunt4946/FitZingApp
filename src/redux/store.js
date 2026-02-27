import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tournamentSlice from './slices/tournamentSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    tournament: tournamentSlice
  },
});

export default store;
