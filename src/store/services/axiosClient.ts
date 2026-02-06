/**
 * Axios Client
 * Based on mobile-application/src/services/client.ts
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getBackendUrl, getBackendUrlV2 } from '../settings';

// Store reference for getting token - will be set by store
let storeRef: any = null;

export const setStoreRef = (store: any) => {
  storeRef = store;
};

const getToken = (): string | null => {
  if (storeRef) {
    return storeRef.getState()?.auth?.token || null;
  }
  return null;
};

export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    async (config) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle 401
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Dispatch logout action
        if (storeRef) {
          storeRef.dispatch({ type: 'auth/logout' });
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const axiosInstance = createAxiosInstance(getBackendUrl());
export const axiosInstanceV2 = createAxiosInstance(getBackendUrlV2());

// HTTP Service class similar to mobile app
export const HttpService = {
  get: async <T>(path: string, params?: Record<string, any>): Promise<T> => {
    const response = await axiosInstance.get(path, { params });
    return response.data;
  },

  post: async <T>(path: string, data?: any): Promise<T> => {
    const response = await axiosInstance.post(path, data);
    return response.data;
  },

  put: async <T>(path: string, data?: any): Promise<T> => {
    const response = await axiosInstance.put(path, data);
    return response.data;
  },

  delete: async <T>(path: string, params?: Record<string, any>): Promise<T> => {
    const response = await axiosInstance.delete(path, { params });
    return response.data;
  },
};
