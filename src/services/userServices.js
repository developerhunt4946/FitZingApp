import { userAPI } from './api';

/**
 * Update user profile
 * @param {Object} payload - { firstName, lastName, phone, city, state }
 * @returns {Promise<Object>}
 */
export const updateProfile = async (payload) => {
    try {
        const response = await userAPI.updateProfile(payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Update FCM token for the user
 * @param {string} fcmToken 
 * @returns {Promise<Object>}
 */
export const updateFcmToken = async (fcmToken) => {
    try {
        const response = await userAPI.updateFcmToken(fcmToken);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
