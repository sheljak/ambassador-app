import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { getBackendUrl, getBackendUrlV2 } from '../settings';
import type { RootState } from '../index';

// Axios base query for RTK Query
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      body?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', body, params }, api) => {
    try {
      // Get token from Redux state
      const token = (api.getState() as RootState).auth.token;

      const result = await axios({
        url: baseUrl + url,
        method,
        data: body,
        params,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      // Handle 401 - logout user
      if (err.response?.status === 401) {
        api.dispatch({ type: 'auth/logout' });
      }

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// Create base API with Axios
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: getBackendUrl() }),
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

// V2 API
export const baseApiV2 = createApi({
  reducerPath: 'apiV2',
  baseQuery: axiosBaseQuery({ baseUrl: getBackendUrlV2() }),
  tagTypes: ['Privacy', 'Blocking'],
  endpoints: () => ({}),
});
