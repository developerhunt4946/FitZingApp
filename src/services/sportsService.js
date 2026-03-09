import apiClient from './apiClient';

const sportsService = {
    /**
     * Fetch all sports categories
     * @returns {Promise}
     */
    fetchSports: async () => {
        try {
            const response = await apiClient.get('/sports');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default sportsService;
