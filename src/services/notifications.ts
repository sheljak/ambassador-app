import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const NotificationService = {
  /**
   * Request notification permission.
   * - If undetermined: shows native permission dialog
   * - If denied: shows alert with link to Settings
   * Returns true if granted.
   */
  async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      // Push notifications don't work on simulators
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    if (existingStatus === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }

    // Status is 'denied' — user previously denied, guide them to Settings
    Alert.alert(
      'Notifications Disabled',
      'Enable notifications in Settings to stay updated on messages and activity.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  },

  /**
   * Check current permission status without prompting.
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (!Device.isDevice) return 'denied';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  },

  /**
   * Get Expo push token for sending notifications.
   * Returns null if permission not granted or on simulator.
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  },

  /**
   * Configure notification handler (how notifications appear when app is in foreground).
   */
  configure() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  },
};
