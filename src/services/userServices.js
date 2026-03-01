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
