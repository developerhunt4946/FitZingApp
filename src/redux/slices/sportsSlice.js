import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sportsService from '../../services/sportsService';

// Thunk to fetch sports categories
export const fetchSports = createAsyncThunk(
    'sports/fetchSports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sportsService.fetchSports();
            // Expecting { status: 'success', results: 7, data: { sports: [...] } }
            return response.data.sports;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch sports');
        }
    }
);

const sportsSlice = createSlice({
    name: 'sports',
    initialState: {
        sports: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSports.fulfilled, (state, action) => {
                state.loading = false;
                state.sports = action.payload;
            })
            .addCase(fetchSports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default sportsSlice.reducer;
