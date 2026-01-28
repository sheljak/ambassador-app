import {
  createApi,
  fetchBaseQuery,
  retry,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getBackendUrl, getBackendUrlV2 } from '../settings';
import type { RootState } from '../index';

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Base query that reads token from Redux state
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: getBackendUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store (in memory)
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Add retry logic (retry once on failure)
const baseQueryWithRetry = retry(baseQueryWithAuth, { maxRetries: 1 });

// Base query with token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Get refresh token from Redux state
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      // Try to refresh token
      const refreshResult = await baseQueryWithRetry(
        {
          url: '/auth/refreshTokens',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (
        refreshResult.data &&
        typeof refreshResult.data === 'object' &&
        'token' in refreshResult.data
      ) {
        // Update token in Redux store
        const refreshData = refreshResult.data as RefreshTokenResponse;
        api.dispatch({
          type: 'auth/setToken',
          payload: {
            token: refreshData.token,
            refreshToken: refreshData.refreshToken,
          },
        });

        // Retry original query
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // Logout user
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token, logout
      api.dispatch({ type: 'auth/logout' });
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
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Privacy', 'Blocking'],
  endpoints: () => ({}),
});
