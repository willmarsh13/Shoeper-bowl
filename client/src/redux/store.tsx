import { configureStore } from '@reduxjs/toolkit';
import {appSlice, filtersSlice, gameInfoSlice, themeSlice} from './reducers/appReducer';
import playersReducer from './playersSlice';
import rosterReducer from './rosterSlice';

export const store = configureStore({
    reducer: {
        theme: themeSlice.reducer,
        players: playersReducer,
        roster: rosterReducer,
        gameInfo: gameInfoSlice.reducer,
        filters: filtersSlice.reducer,
        app: appSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
