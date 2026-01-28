import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnvironmentType, setEnvironment, getEnvironment, getConfig } from '../settings';

interface AppState {
    environment: EnvironmentType;
    isInitialized: boolean;
    isOnline: boolean;
}

const initialState: AppState = {
    environment: getEnvironment(),
    isInitialized: false,
    isOnline: true,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        switchEnvironment: (state, action: PayloadAction<EnvironmentType>) => {
            state.environment = action.payload;
            setEnvironment(action.payload);
        },
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
        },
        setOnlineStatus: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
        },
    },
});

export const { switchEnvironment, setInitialized, setOnlineStatus } = appSlice.actions;

export const selectCurrentEnvironment = (state: { app: AppState }) => state.app.environment;
export const selectEnvironmentConfig = (state: { app: AppState }) => getConfig();
export const selectIsInitialized = (state: { app: AppState }) => state.app.isInitialized;

export default appSlice.reducer;
