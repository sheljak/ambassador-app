/**
 * AuthGuard - Protects routes by checking Redux auth state
 * Loads persisted credentials on app start
 * Redirects to landing if not authenticated
 */

import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';

import { useAppSelector, useAppDispatch, authSelectors, hydrateAuth } from '@/store';
import { useTheme } from '@/theme';
import { AuthStorageService } from '@/services/authStorage';
import { Loader } from '@/components/Loader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [isHydrating, setIsHydrating] = useState(true);

  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const token = useAppSelector(authSelectors.selectToken);

  // Load persisted credentials on mount
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const credentials = await AuthStorageService.loadCredentials();

        if (credentials.token && credentials.user) {
          // Restore auth state from storage
          dispatch(hydrateAuth({
            user: credentials.user,
            token: credentials.token,
            refreshToken: credentials.refreshToken,
          }));
        }
      } catch (error) {
        console.error('Failed to load persisted auth:', error);
      } finally {
        setIsHydrating(false);
      }
    };

    loadPersistedAuth();
  }, [dispatch]);

  // Handle routing after hydration
  useEffect(() => {
    // Don't redirect while hydrating
    if (isHydrating) return;

    const firstSegment = segments[0] as string;
    const inAuthGroup = firstSegment === '(auth)';
    const inProtectedGroup = firstSegment === '(tabs)';

    // If not authenticated and trying to access protected routes
    if (!isAuthenticated && !token && inProtectedGroup) {
      router.replace('/landing' as any);
    }
    // If authenticated and in auth group, redirect to tabs
    else if (isAuthenticated && token && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, token, segments, router, isHydrating]);

  // Show loading while hydrating
  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.primary,
        }}
      >
        <Loader size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check auth and redirect if needed
 * Can be used in any screen
 */
export function useAuthGuard() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const token = useAppSelector(authSelectors.selectToken);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/landing' as any);
    }
  }, [isAuthenticated, token, router]);

  return { isAuthenticated, token };
}

/**
 * Loading screen while checking auth
 */
export function AuthLoading() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
      }}
    >
      <Loader size="large" />
    </View>
  );
}
