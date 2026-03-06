import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            const newNotification = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                read: false,
                ...action.payload,
            };
            state.items = [newNotification, ...state.items];
            state.unreadCount += 1;
        },
        markAllAsRead: (state) => {
            state.items = state.items.map(item => ({ ...item, read: true }));
            state.unreadCount = 0;
        },
        clearAllNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
        markAsRead: (state, action) => {
            const notification = state.items.find(item => item.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount -= 1;
            }
        },
    },
});

export const { addNotification, markAllAsRead, clearAllNotifications, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
