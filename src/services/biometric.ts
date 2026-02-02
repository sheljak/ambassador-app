import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ENABLED: '@biometric_enabled',
  CREDENTIALS: '@biometric_credentials',
  PROMPT_DISMISSED: '@biometric_prompt_dismissed',
} as const;

interface BiometricCredentials {
  email: string;
  password: string;
}

export const BiometricService = {
  /**
   * Check if device has biometric hardware and enrolled biometrics
   */
  isAvailable: async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch {
      return false;
    }
  },

  /**
   * Get biometric type label (Face ID / Touch ID / Biometrics)
   */
  getType: async (): Promise<string> => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      }
      return 'Biometrics';
    } catch {
      return 'Biometrics';
    }
  },

  /**
   * Get raw supported authentication type codes (1 = fingerprint, 2 = facial recognition).
   */
  getRawTypes: async (): Promise<number[]> => {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch {
      return [];
    }
  },

  /**
   * Trigger biometric authentication prompt
   */
  authenticate: async (promptMessage?: string): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to sign in',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Continue regular sign in',
        disableDeviceFallback: true,
      });
      return result.success;
    } catch {
      return false;
    }
  },

  /**
   * Check if biometric login is enabled for this device
   */
  isEnabled: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ENABLED);
      return value === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Enable biometric and store credentials
   */
  enable: async (email: string, password: string): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, 'true');
    await AsyncStorage.setItem(
      STORAGE_KEYS.CREDENTIALS,
      JSON.stringify({ email, password })
    );
  },

  /**
   * Disable biometric and clear stored credentials
   */
  disable: async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, 'false');
    await AsyncStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
  },

  /**
   * Get stored biometric credentials
   */
  getCredentials: async (): Promise<BiometricCredentials | null> => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (!json) return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  /**
   * Clear all biometric data (on logout)
   */
  clearCredentials: async (): Promise<void> => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ENABLED),
      AsyncStorage.removeItem(STORAGE_KEYS.CREDENTIALS),
    ]);
  },

  /**
   * Check if user has dismissed the setup prompt
   */
  isPromptDismissed: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_DISMISSED);
      return value === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Mark the setup prompt as dismissed
   */
  dismissPrompt: async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.PROMPT_DISMISSED, 'true');
  },

  /**
   * Reset prompt dismissed flag (e.g., when re-enabling from settings)
   */
  resetPromptDismissed: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROMPT_DISMISSED);
  },
};
