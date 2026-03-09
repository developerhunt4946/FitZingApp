import apiClient from './apiClient';

// ==============================
// Get All Tournaments
// ==============================
export const getAllTournaments = async () => {
    try {
        const response = await apiClient.get('/tournaments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Get Tournament By ID
// ==============================
export const getTournamentById = async (id) => {
    try {
        const response = await apiClient.get(`/tournaments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Create Tournament
// ==============================
export const createTournament = async (payload) => {
    try {
        const response = await apiClient.post('/tournaments', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Update Tournament
// ==============================
export const updateTournament = async (id, payload) => {
    try {
        const response = await apiClient.put(`/tournaments/${id}`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Delete Tournament
// ==============================
export const deleteTournament = async (id) => {
    try {
        const response = await apiClient.delete(`/tournaments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Register Team
// ==============================
export const registerTeam = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/register`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};