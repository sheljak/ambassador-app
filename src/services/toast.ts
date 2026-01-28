/**
 * Toast Service
 * Wrapper around react-native-toast-message for consistent toast notifications
 */

import Toast, { ToastShowParams } from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

interface ShowToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
  onHide?: () => void;
}

const DEFAULT_DURATION = 4000;

export const ToastService = {
  /**
   * Show a toast notification
   */
  show: ({
    type = 'info',
    title,
    message,
    duration = DEFAULT_DURATION,
    position = 'top',
    onPress,
    onHide,
  }: ShowToastOptions) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: duration,
      position,
      onPress,
      onHide,
      topOffset: 50,
    });
  },

  /**
   * Show success toast
   */
  success: (message: string, title?: string) => {
    ToastService.show({
      type: 'success',
      title: title || 'Success',
      message,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, title?: string) => {
    ToastService.show({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 5000, // Errors stay longer
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, title?: string) => {
    ToastService.show({
      type: 'info',
      title: title || 'Info',
      message,
    });
  },

  /**
   * Hide current toast
   */
  hide: () => {
    Toast.hide();
  },
};
