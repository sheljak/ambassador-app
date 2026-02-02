import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Loader } from '@/components/Loader';
import { useTheme } from '@/theme';
import { useLazyGetHubspotTokenQuery } from '@/store/features/auth/api';
import { useAppSelector } from '@/store';

export default function HelpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const email = useAppSelector((state) => state.auth.user?.email);
  const [getHubspotToken] = useLazyGetHubspotTokenQuery();
  const [hubspotToken, setHubspotToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [webviewLoaded, setWebviewLoaded] = useState(false);

  const isLoading = !tokenReady || !webviewLoaded;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const result = await getHubspotToken().unwrap();
        if (result?.data?.token) {
          setHubspotToken(result.data.token);
        }
      } catch (error) {
        console.error('Failed to get HubSpot token:', error);
      } finally {
        setTokenReady(true);
      }
    };

    fetchToken();
  }, [getHubspotToken]);

  const handleLoadEnd = useCallback(() => {
    setWebviewLoaded(true);
  }, []);

  const uri = `https://tap.st/applinks/hubspot.html${
    hubspotToken ? `?hubspotToken=${hubspotToken}&email=${email || ''}` : ''
  }`;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <ThemedText type="title">Help Center</ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
        keyboardVerticalOffset={-100}
      >
        {tokenReady && (
          <WebView
            source={{ uri }}
            onLoadEnd={handleLoadEnd}
            injectedJavaScript={`
              document.body.style.backgroundColor = '${colors.background.primary}';
              document.documentElement.style.backgroundColor = '${colors.background.primary}';
              true;
            `}
            style={[
              { marginBottom: tabBarHeight, backgroundColor: colors.background.primary },
              !webviewLoaded && styles.hidden,
            ]}
          />
        )}

        {isLoading && (
          <View
            style={[
              styles.loaderOverlay,
              { backgroundColor: colors.background.primary, paddingBottom: tabBarHeight },
            ]}
          >
            <Loader />
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
