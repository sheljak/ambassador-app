import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { useColorScheme } from '@/hooks/useColorScheme';
import { store } from '@/store';
import { AuthGuard } from '@/components/AuthGuard';
import { toastConfig } from '@/components/ToastConfig';
import { Loader } from '@/components/Loader';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('@assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="chat" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthGuard>
          <Toast config={toastConfig} />
        </ThemeProvider>
      </ActionSheetProvider>
    </Provider>
  );
}
