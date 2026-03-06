import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tournamentSlice from './slices/tournamentSlice';
import notificationSlice from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    tournament: tournamentSlice,
    notifications: notificationSlice,
  },
});

export default store;
