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
   * @returns {Promise} - The API response.
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
};

export default cricketScoringService;
