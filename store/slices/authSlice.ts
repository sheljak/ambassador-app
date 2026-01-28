import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Account } from '../features/system/types';
import { authApi, accountApi } from '../api/endpoints';
import apiClient from '../api/client';

interface AuthState {
    user: Account | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        const response = await authApi.login(credentials);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        apiClient.setToken(response.data.token);
        return response.data;
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        const response = await authApi.logout();
        apiClient.setToken(null);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return null;
    }
);

export const fetchAccount = createAsyncThunk(
    'auth/fetchAccount',
    async (_, { rejectWithValue }) => {
        const response = await accountApi.getInfo();
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return response.data.account;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            apiClient.setToken(action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                return initialState;
            })
            .addCase(fetchAccount.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAccount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(fetchAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setToken, clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
