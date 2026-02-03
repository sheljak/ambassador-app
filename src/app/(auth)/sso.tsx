import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks';
import { getTapPageUrl } from '@/store/settings';
import { Loader } from '@/components/Loader';

export default function SsoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signInWithSso } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [isProcessing, setIsProcessing] = useState(false);

  const tapPageUrl = getTapPageUrl();
  const uri = `${tapPageUrl}interaction/sign-in-redirect?sso_app_email=${encodeURIComponent(params.email || '')}`;

  const handleMessage = useCallback(
    async (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.success) {
          setIsProcessing(true);
          const result = await signInWithSso(data.code, params.email);

          if (result.success) {
            router.replace('/(tabs)' as any);
          } else {
            setIsProcessing(false);
          }
        } else {
          Alert.alert(
            '',
            "Sorry, the email you've provided is not in the directory of your organisation. Make sure it's your work email or contact your administrator or our customer support.",
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (e) {
        console.error('SSO message parse error:', e);
        Alert.alert('Error', 'Something went wrong. Please try again.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    },
    [signInWithSso, params.email]
  );

  const handleBack = () => {
    router.back();
  };

  if (isProcessing) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Loader size="large" />
          <ThemedText style={[styles.loadingText, { color: colors.text.secondary }]}>
            Signing in...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <ThemedText style={styles.headerTitleText}>Sign In with SSO</ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <WebView
        source={{ uri }}
        style={styles.webview}
        startInLoadingState
        originWhitelist={['*']}
        onMessage={handleMessage}
        incognito
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <Loader size="large" />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
