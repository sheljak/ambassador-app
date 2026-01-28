import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { useAppSelector, authSelectors } from '@/store';
import { useTheme } from '@/theme';

export default function Index() {
  // Read auth state directly from Redux store
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const token = useAppSelector(authSelectors.selectToken);
  const { colors } = useTheme();

  // Redirect based on Redux auth state
  // If authenticated (has token), go to tabs
  if (isAuthenticated && token) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  // Otherwise, go to landing
  return <Redirect href={'/landing' as any} />;
}
