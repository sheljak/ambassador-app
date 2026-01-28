import type { AuthState } from './types';

export const SLICE_KEY = 'auth';

export const AUTH_DEFAULTS: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER: '@auth_user',
} as const;
