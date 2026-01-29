import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getBackendUrl, getBackendUrlV2 } from '../settings';
import { FingerprintService } from '@/services/fingerprint';
import type { RootState } from '../index';
import { Mutex } from 'async-mutex';

interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
  };
}

// Mutex to prevent multiple simultaneous refresh requests
const mutex = new Mutex();

// Base query that reads token from Redux state
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: getBackendUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store (in memory)
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});


// Base query with token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait if another refresh is in progress
  await mutex.waitForUnlock();

  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Check if we should try to refresh
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        // Get current token from Redux state
        const state = api.getState() as RootState;
        const token = state.auth.token;

        if (token) {
          // Get fingerprint for refresh request
          const fingerprint = await FingerprintService.getFingerprint();

          // Try to refresh token using the current token (like old repo does)
          const refreshResult = await baseQueryWithAuth(
            {
              url: 'v1/application/auth/refreshTokens',
              method: 'POST',
              body: { token, fingerprint },
            },
            api,
            extraOptions
          );

          const refreshData = refreshResult.data as RefreshTokenResponse | undefined;

          if (refreshData?.success && refreshData?.data?.token) {
            // Update token in Redux store
            api.dispatch({
              type: 'auth/setToken',
              payload: {
                token: refreshData.data.token,
              },
            });

            // Retry original query with new token
            result = await baseQueryWithAuth(args, api, extraOptions);
          } else {
            // Refresh failed, logout user
            api.dispatch({ type: 'auth/logout' });
          }
        } else {
          // No token, logout
          api.dispatch({ type: 'auth/logout' });
        }
      } finally {
        release();
      }
    } else {
      // Another refresh is in progress, wait for it and retry
      await mutex.waitForUnlock();
      result = await baseQueryWithAuth(args, api, extraOptions);
    }
  }

  return result;
};

// Create base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Account',
    'Profile',
    'Dialogs',
    'Messages',
    'Feeds',
    'Notifications',
    'Leaderboard',
  ],
  endpoints: () => ({}),
});

// V2 API (separate base URL) - also reads from Redux
export const baseApiV2 = createApi({
  reducerPath: 'apiV2',
  baseQuery: fetchBaseQuery({
    baseUrl: getBackendUrlV2(),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Privacy', 'Blocking'],
  endpoints: () => ({}),
});
