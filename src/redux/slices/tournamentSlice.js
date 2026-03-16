import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllTournaments,
    getAllESportsTournaments,
    getESportsTournamentById,
    createTournament as createTournamentService,
    createESportsTournament as createESportsTournamentService,
    registerTeam as registerTeamService,
    getRegisteredTeams as getRegisteredTeamsService,
    generateFixtures as generateFixturesService,
    getGroups as getGroupsService,
    createGroups as createGroupsService,
    deleteGroup as deleteGroupService,
    getRounds as getRoundsService,
    createRound as createRoundService,
    generateRounds as generateRoundsService,
    updateRoundStatus as updateRoundStatusService,
    getFixtures as getFixturesService,
    getTournamentFixtures as getTournamentFixturesService,
    advanceTournamentFixtures as advanceTournamentFixturesService,
} from '../../services/tournamentServices';

export const fetchGroups = createAsyncThunk(
    'tournament/fetchGroups',
    async ({ tournamentId, categoryId }, { rejectWithValue }) => {
        try {
            const data = await getGroupsService(tournamentId, categoryId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch groups');
        }
    }
);

export const createGroups = createAsyncThunk(
    'tournament/createGroups',
    async ({ tournamentId, categoryId, numberOfGroups, teamsPerGroup, roundId }, { rejectWithValue }) => {
        try {
            const data = await createGroupsService(tournamentId, categoryId, { 
                numberOfGroups, 
                teamsPerGroup,
                roundId
            });
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to create groups');
        }
    }
);

export const deleteGroup = createAsyncThunk(
    'tournament/deleteGroup',
    async ({ tournamentId, categoryId, groupId }, { rejectWithValue }) => {
        try {
            await deleteGroupService(tournamentId, categoryId, groupId);
            return groupId;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to delete group');
        }
    }
);

export const generateFixtures = createAsyncThunk(
    'tournament/generateFixtures',
    async ({ tournamentId, categoryId, roundNo }, { rejectWithValue }) => {
        try {
            const data = await generateFixturesService(tournamentId, categoryId, { roundNo });
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to generate fixtures'
            );
        }
    }
);

export const fetchRounds = createAsyncThunk(
    'tournament/fetchRounds',
    async ({ tournamentId, categoryId }, { rejectWithValue }) => {
        try {
            const data = await getRoundsService(tournamentId, categoryId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch rounds');
        }
    }
);

export const generateRounds = createAsyncThunk(
    'tournament/generateRounds',
    async ({ tournamentId, categoryId, mode, groupSize }, { rejectWithValue }) => {
        try {
            const data = await generateRoundsService(tournamentId, categoryId, { mode, groupSize });
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to generate rounds');
        }
    }
);

export const createRound = createAsyncThunk(
    'tournament/createRound',
    async ({ tournamentId, categoryId, payload }, { rejectWithValue }) => {
        try {
            const data = await createRoundService(tournamentId, categoryId, payload);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to create round');
        }
    }
);

export const updateRoundStatus = createAsyncThunk(
    'tournament/updateRoundStatus',
    async ({ roundId, status, name }, { rejectWithValue }) => {
        try {
            const data = await updateRoundStatusService(roundId, { status, name });
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to update round status');
        }
    }
);

export const fetchFixtures = createAsyncThunk(
    'tournament/fetchFixtures',
    async ({ tournamentId, categoryId, roundId }, { rejectWithValue }) => {
        try {
            const data = await getFixturesService(tournamentId, categoryId, roundId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch fixtures');
        }
    }
);

export const fetchTournamentFixtures = createAsyncThunk(
    'tournament/fetchTournamentFixtures',
    async (tournamentId, { rejectWithValue }) => {
        try {
            const data = await getTournamentFixturesService(tournamentId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch tournament fixtures');
        }
    }
);

export const fetchRegisteredTeams = createAsyncThunk(
    'tournament/fetchRegisteredTeams',
    async ({ tournamentId, categoryId }, { rejectWithValue }) => {
        try {
            const data = await getRegisteredTeamsService(tournamentId, categoryId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to fetch registered teams'
            );
        }
    }
);

export const fetchTournaments = createAsyncThunk(
    'tournament/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getAllTournaments();
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to fetch tournaments'
            );
        }
    }
);

export const fetchESportsTournaments = createAsyncThunk(
    'tournament/fetchAllESports',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getAllESportsTournaments();
            return data?.data?.tournaments || data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to fetch eSports tournaments'
            );
        }
    }
);

export const fetchESportsTournamentById = createAsyncThunk(
    'tournament/fetchESportsById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await getESportsTournamentById(id);
            return data?.data?.tournament || data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to fetch eSports tournament'
            );
        }
    }
);

export const createTournament = createAsyncThunk(
    'tournament/create',
    async (payload, { rejectWithValue }) => {
        try {
            const data = await createTournamentService(payload);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to create tournament'
            );
        }
    }
);

export const createESportsTournament = createAsyncThunk(
    'tournament/createESports',
    async (payload, { rejectWithValue }) => {
        try {
            const data = await createESportsTournamentService(payload);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to create eSports tournament'
            );
        }
    }
);

export const registerTeam = createAsyncThunk(
    'tournament/registerTeam',
    async ({ tournamentId, categoryId, registrationData }, { rejectWithValue }) => {
        try {
            const data = await registerTeamService(tournamentId, categoryId, registrationData);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Registration failed'
            );
        }
    }
);

export const advanceTournament = createAsyncThunk(
    'tournament/advance',
    async ({ tournamentId, categoryId, nextFormat, numberOfGroups, teamsPerGroup }, { rejectWithValue }) => {
        try {
            const data = await advanceTournamentFixturesService(tournamentId, categoryId, { 
                nextFormat, 
                numberOfGroups, 
                teamsPerGroup 
            });
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to advance tournament');
        }
    }
);

const tournamentSlice = createSlice({
    name: 'tournament',
    initialState: {
        tournaments: [],
        eSportsTournaments: [],
        selectedESportsTournament: null,
        registeredTeams: [],
        loading: false,
        eSportsLoading: false,
        teamsLoading: false,
        groups: [],
        groupsLoading: false,
        rounds: [],
        roundsLoading: false,
        fixtures: [],
        fixturesLoading: false,
        error: null,
    },
    reducers: {
        clearTournamentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTournaments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTournaments.fulfilled, (state, action) => {
                state.loading = false;
                state.tournaments = action.payload;
            })
            .addCase(fetchTournaments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch eSports Tournaments
            .addCase(fetchESportsTournaments.pending, (state) => {
                state.eSportsLoading = true;
                state.error = null;
            })
            .addCase(fetchESportsTournaments.fulfilled, (state, action) => {
                state.eSportsLoading = false;
                state.eSportsTournaments = action.payload;
            })
            .addCase(fetchESportsTournaments.rejected, (state, action) => {
                state.eSportsLoading = false;
                state.error = action.payload;
            })
            // Fetch eSports Tournament By ID
            .addCase(fetchESportsTournamentById.pending, (state) => {
                state.eSportsLoading = true;
                state.error = null;
            })
            .addCase(fetchESportsTournamentById.fulfilled, (state, action) => {
                state.eSportsLoading = false;
                state.selectedESportsTournament = action.payload;
            })
            .addCase(fetchESportsTournamentById.rejected, (state, action) => {
                state.eSportsLoading = false;
                state.error = action.payload;
            })
            // Create Tournament
            .addCase(createTournament.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTournament.fulfilled, (state, action) => {
                state.loading = false;
                state.tournaments = [action.payload, ...state.tournaments];
            })
            .addCase(createTournament.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create eSports Tournament
            .addCase(createESportsTournament.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createESportsTournament.fulfilled, (state, action) => {
                state.loading = false;
                state.tournaments = [action.payload, ...state.tournaments];
            })
            .addCase(createESportsTournament.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register Team
            .addCase(registerTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerTeam.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Registered Teams
            .addCase(fetchRegisteredTeams.pending, (state) => {
                state.teamsLoading = true;
                state.error = null;
            })
            .addCase(fetchRegisteredTeams.fulfilled, (state, action) => {
                state.teamsLoading = false;
                state.registeredTeams = action.payload;
            })
            .addCase(fetchRegisteredTeams.rejected, (state, action) => {
                state.teamsLoading = false;
                state.error = action.payload;
            })
            // Generate Fixtures
            .addCase(generateFixtures.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateFixtures.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Note: We might update tournaments or categories here if needed
            })
            .addCase(generateFixtures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Groups
            .addCase(fetchGroups.pending, (state) => {
                state.groupsLoading = true;
                state.error = null;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.groupsLoading = false;
                // Always store as array to prevent .filter crash
                const payload = action.payload;
                state.groups = Array.isArray(payload) ? payload : (payload?.groups || payload?.data || []);
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.groupsLoading = false;
                state.error = action.payload;
            })
            .addCase(createGroups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroups.fulfilled, (state, action) => {
                state.loading = false;
                // Don't overwrite groups with non-array creation response
                // Groups will be re-fetched by the calling screen after creation
            })
            .addCase(createGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = state.groups.filter(g => g.id !== action.payload && g.groupId !== action.payload);
            })
            .addCase(deleteGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Rounds
            .addCase(fetchRounds.pending, (state) => {
                state.roundsLoading = true;
                state.error = null;
            })
            .addCase(fetchRounds.fulfilled, (state, action) => {
                state.roundsLoading = false;
                state.rounds = action.payload;
            })
            .addCase(fetchRounds.rejected, (state, action) => {
                state.roundsLoading = false;
                state.error = action.payload;
            })
            .addCase(generateRounds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateRounds.fulfilled, (state, action) => {
                state.loading = false;
                // Typically you'd refetch or add to rounds
            })
            .addCase(generateRounds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createRound.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRound.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.rounds = [...state.rounds, action.payload];
                }
            })
            .addCase(createRound.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateRoundStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRoundStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Update local round if needed
            })
            .addCase(updateRoundStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fixtures
            .addCase(fetchFixtures.pending, (state) => {
                state.fixturesLoading = true;
                state.error = null;
            })
            .addCase(fetchFixtures.fulfilled, (state, action) => {
                state.fixturesLoading = false;
                state.fixtures = action.payload;
            })
            .addCase(fetchFixtures.rejected, (state, action) => {
                state.fixturesLoading = false;
                state.error = action.payload;
            })
            // Tournament Fixtures
            .addCase(fetchTournamentFixtures.pending, (state) => {
                state.fixturesLoading = true;
                state.error = null;
            })
            .addCase(fetchTournamentFixtures.fulfilled, (state, action) => {
                state.fixturesLoading = false;
                state.fixtures = action.payload;
            })
            .addCase(fetchTournamentFixtures.rejected, (state, action) => {
                state.fixturesLoading = false;
                state.error = action.payload;
            })
            // Advance Tournament
            .addCase(advanceTournament.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(advanceTournament.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(advanceTournament.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearTournamentError } = tournamentSlice.actions;
export default tournamentSlice.reducer;