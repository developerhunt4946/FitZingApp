import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllTournaments,
    createTournament as createTournamentService,
    registerTeam as registerTeamService
} from '../../services/tournamentServices';

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
        loading: false,
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
            });
    },
});

export const { clearTournamentError } = tournamentSlice.actions;
export default tournamentSlice.reducer;