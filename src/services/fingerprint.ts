/**
 * Fingerprint Service
 * Generates and manages device fingerprint for API authentication
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FINGERPRINT_KEY = '@fingerprint';

/**
 * Encode string to base64
 */
function encodeBase64(str: string): string {
  // Use btoa for web, manual encoding for native
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  // Simple base64 encoding for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const byte1 = str.charCodeAt(i);
    const byte2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const byte3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = byte3 & 63;

    if (i + 1 >= str.length) {
      output += chars.charAt(enc1) + chars.charAt(enc2) + '==';
    } else if (i + 2 >= str.length) {
      output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + '=';
    } else {
      output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
    }
  }
  return output;
}

/**
 * Generate a unique device identifier
 */
async function getDeviceUniqueId(): Promise<string> {
  try {
    if (Platform.OS === 'ios') {
      // iOS: Use identifierForVendor
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId || 'unknown-ios';
    } else if (Platform.OS === 'android') {
      // Android: Use androidId
      const androidId = Application.getAndroidId();
      return androidId || 'unknown-android';
    } else {
      // Web: Generate a UUID and store it
      const webId = await AsyncStorage.getItem('@web_device_id');
      if (webId) return webId;

      const newWebId = Crypto.randomUUID();
      await AsyncStorage.setItem('@web_device_id', newWebId);
      return newWebId;
    }
  } catch (error) {
    console.warn('Failed to get device unique ID:', error);
    return 'unknown-device';
  }
}

/**
 * Generate fingerprint data from device info
 */
async function generateFingerprintData(): Promise<string> {
  const deviceId = await getDeviceUniqueId();
  const deviceModel = Device.modelName || 'unknown';
  const deviceBrand = Device.brand || 'unknown';
  const osName = Device.osName || Platform.OS;
  const osVersion = Device.osVersion || 'unknown';
  const timestamp = Date.now();

  const data = `${deviceId}|${deviceModel}|${deviceBrand}|${osName}|${osVersion}|${timestamp}`;
  return encodeBase64(data);
}

export const FingerprintService = {
  /**
   * Get existing fingerprint or generate a new one
   */
  getFingerprint: async (): Promise<string> => {
    try {
      // Try to get existing fingerprint
      const existingFingerprint = await AsyncStorage.getItem(FINGERPRINT_KEY);
      if (existingFingerprint) {
        return existingFingerprint;
      }

      // Generate new fingerprint
      const fingerprint = await generateFingerprintData();
      await AsyncStorage.setItem(FINGERPRINT_KEY, fingerprint);
      return fingerprint;
    } catch (error) {
      console.warn('Failed to get/generate fingerprint:', error);
      // Return a fallback fingerprint
      return encodeBase64(`fallback|${Date.now()}`);
    }
  },

  /**
   * Clear stored fingerprint (on logout/account delete)
   */
  clearFingerprint: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(FINGERPRINT_KEY);
    } catch (error) {
      console.warn('Failed to clear fingerprint:', error);
    }
  },

  /**
   * Regenerate fingerprint (force new generation)
   */
  regenerateFingerprint: async (): Promise<string> => {
    await FingerprintService.clearFingerprint();
    return FingerprintService.getFingerprint();
  },
};
