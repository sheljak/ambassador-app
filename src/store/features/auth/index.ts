import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_KEY, AUTH_DEFAULTS } from './constants';
import type { AuthState, SetCredentialsPayload } from './types';
import type { User } from '../../types_that_will_used';

const initialState: AuthState = AUTH_DEFAULTS;

const authSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    // Hydrate auth state from storage (on app start)
    hydrateAuth(
      state,
      action: PayloadAction<{
        user: User | null;
        token: string | null;
        refreshToken?: string | null;
      }>
    ) {
      const { user, token, refreshToken } = action.payload;
      if (token && user) {
        state.user = user;
        state.token = token;
        state.refreshToken = refreshToken || null;
        state.isAuthenticated = true;
      }
      state.isLoading = false;
    },

    // Set credentials (token + user) - main action for login
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // Set user data only
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Set token only
    setToken(
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Alias for setLoading
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Set error
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Alias for setError
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },

    // Logout - clears all auth state
    logout() {
      return initialState;
    },

    // Alias for logout
    resetAuth() {
      return initialState;
    },
  },
});

export const {
  hydrateAuth,
  setCredentials,
  setUser,
  setToken,
  setLoading,
  setAuthLoading,
  setError,
  setAuthError,
  clearError,
  logout,
  resetAuth,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

// Re-export everything
export * from './api';
export * from './selectors';
export * from './constants';
export type { AuthState } from './types';
