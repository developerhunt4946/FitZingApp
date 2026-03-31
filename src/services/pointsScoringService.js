import apiClient from './apiClient';

// ==============================
// Add Point (POST /points-scoring)
// ==============================
export const addPoint = async (payload) => {
    try {
        console.log('POST /points-scoring body:', JSON.stringify(payload, null, 2));
        const response = await apiClient.post('/points-scoring', payload);
        return response.data;
    } catch (error) {
        console.log('Error POST /points-scoring:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// ==============================
// Delete Point (DELETE /points-scoring/{id})
// ==============================
export const deletePoint = async (id) => {
    try {
        console.log('DELETE /points-scoring/{id} ID:', id);
        const response = await apiClient.delete(`/points-scoring/${id}`);
        return response.data;
    } catch (error) {
        console.log(`Error DELETE /points-scoring/${id}:`, error.response?.data || error);
        throw error.response?.data || error;
    }
};

// ==============================
// Get All Points by Fixture ID (GET /points-scoring/fixture/{fixtureId})
// ==============================
export const getPointsByFixture = async (fixtureId) => {
    try {
        const response = await apiClient.get(`/points-scoring/fixture/${fixtureId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Get Points Scorecard by Fixture ID (GET /points-scoring/{fixtureId}/scorecard)
// ==============================
export const getPointsScorecard = async (fixtureId) => {
    try {
        const response = await apiClient.get(`/points-scoring/${fixtureId}/scorecard`);
        return response.data;
    } catch (error) {
        console.log('Error fetching scorecard:', error.response?.data || error);
        throw error.response?.data || error;
    }
};
