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
// Get All eSports Tournaments
// ==============================
export const getAllESportsTournaments = async () => {
    try {
        const response = await apiClient.get('/esports/tournaments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Get eSports Tournament By ID
// ==============================
export const getESportsTournamentById = async (id) => {
    try {
        const response = await apiClient.get(`/esports/tournaments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Create eSports Tournament
// ==============================
export const createESportsTournament = async (payload) => {
    try {
        const response = await apiClient.post('/esports/tournaments', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Register eSports Team
// ==============================
export const registerESportsTeam = async (payload) => {
    try {
        const response = await apiClient.post('/esports/register', payload);
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

// ==============================
// Get Registered Teams
// ==============================
export const getRegisteredTeams = async (tournamentId, categoryId) => {
    try {
        const url = categoryId
            ? `/tournaments/${tournamentId}/teams?categoryId=${categoryId}`
            : `/tournaments/${tournamentId}/teams`;
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Fixtures Management
// ==============================
export const getTournamentFixtures = async (tournamentId) => {
    try {
        const response = await apiClient.get(`/tournaments/${tournamentId}/fixtures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getFixtures = async (tournamentId, categoryId, roundId) => {
    try {
        let url = `/tournaments/${tournamentId}/categories/${categoryId}/fixtures`;
        if (roundId) {
            url += `?roundId=${roundId}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const generateFixtures = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/fixtures/generate`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Rounds Management
// ==============================
export const getRounds = async (tournamentId, categoryId) => {
    try {
        const response = await apiClient.get(`/tournaments/${tournamentId}/categories/${categoryId}/rounds`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createRound = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/rounds`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const generateRounds = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/rounds/generate`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateRoundStatus = async (roundId, payload) => {
    try {
        const response = await apiClient.patch(`/tournaments/rounds/${roundId}`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Group Management
// ==============================
export const getGroups = async (tournamentId, categoryId) => {
    try {
        const response = await apiClient.get(`/tournaments/${tournamentId}/categories/${categoryId}/groups`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createGroups = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/groups/generate`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteGroup = async (tournamentId, categoryId, groupId) => {
    try {
        const response = await apiClient.delete(`/tournaments/${tournamentId}/categories/${categoryId}/groups/${groupId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Advance Tournament
// ==============================
export const advanceTournamentFixtures = async (tournamentId, categoryId, payload) => {
    try {
        const response = await apiClient.post(`/tournaments/${tournamentId}/categories/${categoryId}/fixtures/advance`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};