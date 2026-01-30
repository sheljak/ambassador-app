import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface PickedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

export interface PickerOptions {
  maxWidth?: number;
  compress?: number;
  useFrontCamera?: boolean;
  allowsEditing?: boolean;
  aspect?: [number, number];
}

const DEFAULTS = {
  maxWidth: 600,
  compress: 0.9,
};

function isCancelledError(error: unknown): boolean {
  const code = (error as any)?.code;
  return code === 'E_PICKER_CANCELLED' || code === 'ERR_CANCELED';
}

async function requestPermission(useCamera: boolean): Promise<boolean> {
  const getPermission = useCamera
    ? ImagePicker.getCameraPermissionsAsync
    : ImagePicker.getMediaLibraryPermissionsAsync;
  const requestPerm = useCamera
    ? ImagePicker.requestCameraPermissionsAsync
    : ImagePicker.requestMediaLibraryPermissionsAsync;

  const { status, canAskAgain } = await getPermission();

  if (status === 'granted') return true;

  if (canAskAgain) {
    const result = await requestPerm();
    return result.status === 'granted';
  }

  const source = useCamera ? 'camera' : 'photo library';
  Alert.alert(
    'Permission Required',
    `${source.charAt(0).toUpperCase() + source.slice(1)} access was denied. Please enable it in Settings.`,
    [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
  return false;
}

async function processImage(
  uri: string,
  maxWidth = DEFAULTS.maxWidth,
  compress = DEFAULTS.compress,
): Promise<PickedImage | null> {
  try {
    const processed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!processed.base64) return null;

    return {
      uri: processed.uri,
      base64: processed.base64,
      width: processed.width,
      height: processed.height,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return null;
  }
}

export const ImagePickerService = {
  /**
   * Open camera with built-in crop editor, returns processed image with base64.
   */
  async openCamera(options: PickerOptions = {}): Promise<PickedImage | null> {
    try {
      const granted = await requestPermission(true);
      if (!granted) return null;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: 0.7,
        cameraType: options.useFrontCamera
          ? ImagePicker.CameraType.front
          : ImagePicker.CameraType.back,
      });

      if (result.canceled || !result.assets?.[0]) return null;
      return processImage(result.assets[0].uri, options.maxWidth, options.compress);
    } catch (error) {
      if (!isCancelledError(error)) {
        console.error('Camera error:', error);
      }
      return null;
    }
  },

  /**
   * Open photo library with built-in crop editor, returns processed image with base64.
   */
  async openPicker(options: PickerOptions = {}): Promise<PickedImage | null> {
    try {
      const granted = await requestPermission(false);
      if (!granted) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: 0.7,
        mediaTypes: ['images'],
      });

      if (result.canceled || !result.assets?.[0]) return null;
      return processImage(result.assets[0].uri, options.maxWidth, options.compress);
    } catch (error) {
      if (!isCancelledError(error)) {
        console.error('Picker error:', error);
      }
      return null;
    }
  },

  processImage,
};
