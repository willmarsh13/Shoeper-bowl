import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player } from '../Interfaces/Player';
import {getPlayers} from "../pages/BuildTeam/logic/getPlayers";

interface PlayersState {
    players: Player[];
    loading: boolean;
    error?: string;
    page: number;
    hasMore: boolean;
    search: string;
}

const initialState: PlayersState = {
    players: [],
    loading: false,
    page: 1,
    hasMore: true,
    search: '',
};

export const fetchPlayers = createAsyncThunk<
    { results: Player[]; page: number; total: number },
    { search?: string; page?: number }
>('players/fetch', async ({ search = '', page = 1 }) => {
    const res = await getPlayers({ search, page, pageSize: 100 }, 200);
    return { results: res.results, page, total: res.total };
});


const playersSlice = createSlice({
    name: 'players',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPlayers.fulfilled, (state, action) => {
            state.loading = false;

            if (action.payload.page === 1) {
                state.players = action.payload.results;
            } else {
                state.players.push(...action.payload.results);
            }

            state.page = action.payload.page;
            state.hasMore = state.players.length < action.payload.total;
        });

    },
});

export default playersSlice.reducer;
