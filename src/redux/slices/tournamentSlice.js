import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllTournaments,
    createTournament as createTournamentService,
    registerTeam as registerTeamService,
    getRegisteredTeams as getRegisteredTeamsService,
    generateFixtures as generateFixturesService,
    getGroups as getGroupsService,
    createGroups as createGroupsService,
    deleteGroup as deleteGroupService
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
    async ({ tournamentId, categoryId }, { rejectWithValue }) => {
        try {
            const data = await createGroupsService(tournamentId, categoryId);
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
    async ({ tournamentId, categoryId }, { rejectWithValue }) => {
        try {
            const data = await generateFixturesService(tournamentId, categoryId);
            return data?.data || data;
        } catch (error) {
            return rejectWithValue(
                error?.message || 'Failed to generate fixtures'
            );
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

const tournamentSlice = createSlice({
    name: 'tournament',
    initialState: {
        tournaments: [],
        registeredTeams: [],
        loading: false,
        teamsLoading: false,
        groups: [],
        groupsLoading: false,
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
                state.groups = action.payload;
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
                state.groups = action.payload;
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
            });
    },
});

export const { clearTournamentError } = tournamentSlice.actions;
export default tournamentSlice.reducer;