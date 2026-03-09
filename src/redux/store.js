import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tournamentSlice from './slices/tournamentSlice';
import notificationSlice from './slices/notificationSlice';
import sportsSlice from './slices/sportsSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    tournament: tournamentSlice,
    notifications: notificationSlice,
    sports: sportsSlice,
  },
});

export default store;
