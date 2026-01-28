/**
 * Auth Storage Service
 * Handles persisting and loading auth state from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/store';

const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER: '@auth_user',
} as const;

export interface PersistedAuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

export const AuthStorageService = {
  /**
   * Save auth credentials to storage
   */
  saveCredentials: async (credentials: {
    token: string;
    refreshToken?: string;
    user: User;
  }): Promise<void> => {
    try {
      const promises: Promise<void>[] = [
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, credentials.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(credentials.user)),
      ];

      if (credentials.refreshToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, credentials.refreshToken)
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save auth credentials:', error);
    }
  },

  /**
   * Load auth credentials from storage
   */
  loadCredentials: async (): Promise<PersistedAuthState> => {
    try {
      const [token, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      let user: User | null = null;
      if (userJson) {
        try {
          user = JSON.parse(userJson);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }

      return {
        token,
        refreshToken,
        user,
      };
    } catch (error) {
      console.error('Failed to load auth credentials:', error);
      return {
        token: null,
        refreshToken: null,
        user: null,
      };
    }
  },

  /**
   * Clear all auth data from storage
   */
  clearCredentials: async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Failed to clear auth credentials:', error);
    }
  },

  /**
   * Update just the token (for token refresh)
   */
  updateToken: async (token: string, refreshToken?: string): Promise<void> => {
    try {
      const promises: Promise<void>[] = [
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ];

      if (refreshToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to update token:', error);
    }
  },

  /**
   * Update user data
   */
  updateUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  },

  /**
   * Check if user has stored credentials
   */
  hasCredentials: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  },
};
