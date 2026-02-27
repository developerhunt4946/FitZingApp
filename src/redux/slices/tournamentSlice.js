import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllTournaments } from '../../services/tournamentServices';

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
            });
    },
});

export const { clearTournamentError } = tournamentSlice.actions;
export default tournamentSlice.reducer;