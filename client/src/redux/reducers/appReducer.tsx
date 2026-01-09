import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppState, Filters, GameInfo, ThemeState} from "../../Interfaces/App";
import {PlayoffRound} from "../../pages/BuildTeam/logic/roundRules";
import {Position} from "../../Interfaces/Player";

const initialThemeState: ThemeState = {
    mode: 'dark',
};

const initialAppState: AppState = {
    headerHeight: 68.4,
    footerHeight: 0,
}

const initialGameInfoState: GameInfo = {
    round: 'WILD_CARD',
    teams: [],
    status: 'Locked'
}

const initialFiltersState: Filters = {
    teams: [],
    positions: [],
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState: initialThemeState,
    reducers: {
        setMode: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.mode = action.payload;
        },
        toggleMode: (state) => {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
        },
    },
});

export const gameInfoSlice = createSlice({
    name: 'gameInfo',
    initialState: initialGameInfoState,
    reducers: {
        setRound: (state, action: PayloadAction<PlayoffRound>) => {
            state.round = action.payload;
        },
        setTeams: (state, action: PayloadAction<string[]>) => {
            state.teams = action.payload;
        },
    },
});

export const filtersSlice = createSlice({
    name: 'filters',
    initialState: initialFiltersState,
    reducers: {
        setTeamFilters: (state, action: PayloadAction<string[]>) => {
            state.teams = action.payload;
        },
        setPositionFilters: (state, action: PayloadAction<Position[]>) => {
            state.positions = action.payload;
        },
    },
});

export const appSlice = createSlice({
    name: 'app',
    initialState: initialAppState,
    reducers: {
        setHeaderHeight: (state, action: PayloadAction<number>) => {
            state.headerHeight = action.payload;
        },
    }
})

export const {setMode, toggleMode} = themeSlice.actions;
export const {setRound, setTeams} = gameInfoSlice.actions;
export const {setTeamFilters, setPositionFilters} = filtersSlice.actions;
export const {setHeaderHeight} = appSlice.actions;