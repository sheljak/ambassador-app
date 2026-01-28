/**
 * useAuth hook - provides auth state and actions from Redux store
 * Persists auth data to AsyncStorage for session persistence
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  useAppDispatch,
  useAppSelector,
  useLoginMutation,
  useLazyGetAccountQuery,
  authSelectors,
  setCredentials,
  setAuthLoading,
  setAuthError,
  logout as logoutAction,
  baseApi,
} from '@/store';
import { FingerprintService } from '@/services/fingerprint';
import { AuthStorageService } from '@/services/authStorage';
import { ToastService } from '@/services/toast';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Selectors
  const user = useAppSelector(authSelectors.selectUser);
  const token = useAppSelector(authSelectors.selectToken);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const error = useAppSelector(authSelectors.selectAuthError);

  // RTK Query mutations
  const [loginMutation] = useLoginMutation();
  const [getAccount] = useLazyGetAccountQuery();

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));

        // Get device fingerprint
        const fingerprint = await FingerprintService.getFingerprint();

        // Call login API with fingerprint
        const loginResult = await loginMutation({
          email,
          password,
          fingerprint,
        }).unwrap();

        if (!loginResult.success || !loginResult.data) {
          const errorMsg = loginResult.message || 'Login failed';
          dispatch(setAuthError(errorMsg));
          ToastService.error(errorMsg, 'Login Failed');
          return { success: false, error: errorMsg };
        }

        const { token, user: loginUser } = loginResult.data;

        // If we have user from login response, use it
        if (loginUser) {
          dispatch(setCredentials({ user: loginUser, token }));
          // Persist to storage
          await AuthStorageService.saveCredentials({ user: loginUser, token });
        } else {
          // Store token first, then fetch account info
          const tempUser = { id: 0, email } as any;
          dispatch(setCredentials({ user: tempUser, token }));
        }

        // Fetch latest account info
        try {
          const accountResult = await getAccount();
          if (accountResult.data?.success && accountResult.data?.data?.account) {
            const account = accountResult.data.data.account;
            dispatch(setCredentials({ user: account, token }));
            // Update persisted user data
            await AuthStorageService.saveCredentials({ user: account, token });
          }
        } catch (e) {
          // Ignore account fetch error if we already have user from login
          if (!loginUser) {
            console.warn('Failed to fetch account info:', e);
          }
        }

        ToastService.success('Welcome back!', 'Login Successful');
        return { success: true };
      } catch (err: any) {
        const errorMessage =
          err?.data?.message || err?.message || 'An error occurred';
        dispatch(setAuthError(errorMessage));
        ToastService.error(errorMessage, 'Login Failed');
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, loginMutation, getAccount]
  );

  // Sign out function
  const signOut = useCallback(async () => {
    // Clear persisted credentials
    await AuthStorageService.clearCredentials();
    // Clear fingerprint on logout
    await FingerprintService.clearFingerprint();
    // Reset RTK Query cache to prevent stale API calls
    dispatch(baseApi.util.resetApiState());
    // Clear Redux state
    dispatch(logoutAction());
    ToastService.info('You have been signed out', 'Signed Out');
    router.replace('/landing' as any);
  }, [dispatch, router]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(setAuthError(null));
  }, [dispatch]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    signIn,
    signOut,
    clearError,
  };
}
