import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import feedsReducer from './slices/feedsSlice';
import dialogsReducer from './slices/dialogsSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        feeds: feedsReducer,
        dialogs: dialogsReducer,
        app: appReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export * from './settings';
export * from './api/client';
export * from './api/endpoints';
export { switchEnvironment, selectCurrentEnvironment, selectEnvironmentConfig } from './slices/appSlice';
