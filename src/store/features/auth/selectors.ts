import { createSelector } from '@reduxjs/toolkit';
import { SLICE_KEY } from './constants';
import type { AuthState } from './types';

type RootState = {
  [SLICE_KEY]: AuthState;
};

// Base selector
const selectAuthSlice = (state: RootState): AuthState => state[SLICE_KEY];

// Memoized selectors
export const selectUser = createSelector(
  [selectAuthSlice],
  (auth) => auth.user
);

export const selectToken = createSelector(
  [selectAuthSlice],
  (auth) => auth.token
);

export const selectIsAuthenticated = createSelector(
  [selectAuthSlice],
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAuthSlice],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuthSlice],
  (auth) => auth.error
);

export const selectAuthState = createSelector(
  [selectAuthSlice],
  (auth) => ({
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
  })
);

export const authSelectors = {
  selectAuthSlice,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectAuthState,
};
