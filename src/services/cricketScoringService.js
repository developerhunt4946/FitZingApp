import apiClient from './apiClient';

/**
 * Service for handling cricket scoring related API calls.
 */
const cricketScoringService = {
  /**
   * Updates the status of a cricket match (fixture).
   * @param {string} fixtureId - The ID of the fixture to update.
   * @param {string} status - The new status (e.g., 'NotStarted', 'inProgress', 'completed').
   * @returns {Promise} - The API response.
   */
  updateMatchStatus: async (fixtureId, status) => {
    try {
      const response = await apiClient.patch(`/cricket-scoring/${fixtureId}/status`, {
        status: status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating match status for fixture ${fixtureId}:`, error);
      throw error;
    }
  },

  /**
   * Submits the toss result for a cricket match.
   * @param {string} fixtureId - The ID of the fixture.
   * @param {object} tossData - The toss result data.
   * @param {string} tossData.tossWinnerId - The ID of the team that won the toss.
   * @param {string} tossData.tossDecision - The decision made by the toss winner ('batting' or 'bowling').
   * @param {string} tossData.battingTeamId - The ID of the team that will bat first.
   * @param {string} tossData.bowlingTeamId - The ID of the team that will bowl first.
   */
  submitTossResult: async (fixtureId, tossData) => {
    try {
      const response = await apiClient.put(`/cricket-scoring/${fixtureId}/toss`, tossData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting toss result for fixture ${fixtureId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches the details of a cricket fixture including the current scoring state.
   * @param {string} fixtureId - The ID of the fixture.
   * @returns {Promise} - The API response.
   */
  getFixtureDetails: async (fixtureId) => {
    try {
      const response = await apiClient.get(`/cricket-scoring/${fixtureId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fixture details for fixture ${fixtureId}:`, error);
      throw error;
    }
  },

  /**
   * Submits ball-by-ball statistics for a cricket match.
   * @param {string} fixtureId - The ID of the fixture.
   * @param {object} payload - The ball statistics payload.
   * @returns {Promise} - The API response.
   */
  submitBallStats: async (fixtureId, payload) => {
    try {
      const response = await apiClient.post(`/cricket-scoring/${fixtureId}/ball`, payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting ball stats:', error);
      throw error;
    }
  },

  /**
   * Fetches the live scoreboard for a cricket fixture.
   * @param {string} fixtureId - The ID of the fixture.
   * @returns {Promise} - The API response with matchDetails & innings.
   */
  getScoreboard: async (fixtureId) => {
    try {
      const response = await apiClient.get(`/cricket-scoring/${fixtureId}/scoreboard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scoreboard for fixture ${fixtureId}:`, error);
      throw error;
    }
  },
  /**
   * Marks an innings as complete.
   * @param {string} fixtureId - The ID of the fixture.
   * @param {string} battingTeamId - The ID of the team that just finished batting.
   * @returns {Promise} - The API response.
   */
  completeInnings: async (fixtureId, battingTeamId) => {
    try {
      const response = await apiClient.patch(`/cricket-scoring/${fixtureId}/complete-innings`, {
        battingTeamId: battingTeamId,
      });
      return response.data;
    } catch (error) {
      console.error(`Error completing innings for fixture ${fixtureId}:`, error);
      throw error;
    }
  },
};

export default cricketScoringService;
