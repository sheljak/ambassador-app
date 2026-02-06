/**
 * Custom Toast Configuration
 * Themed toast components for react-native-toast-message
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastConfig } from 'react-native-toast-message';
import { useTheme } from '@/theme';
import { useToastStyles } from './ToastConfig.styles';

interface CustomToastProps {
  text1?: string;
  text2?: string;
  onPress?: () => void;
  type: 'success' | 'error' | 'info';
}

const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, onPress, type }) => {
  const { colors, shapes, shadows, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useToastStyles();

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.status.success;
      case 'error':
        return colors.status.error;
      case 'info':
      default:
        return colors.interactive.default;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderRadius: shapes.radius.lg,
          borderLeftColor: getBackgroundColor(),
          marginTop: insets.top > 0 ? 0 : spacing.sm,
          ...shadows.lg,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      <View style={styles.textContainer}>
        {text1 && (
          <Text
            style={[styles.title, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {text1}
          </Text>
        )}
        {text2 && (
          <Text
            style={[styles.message, { color: colors.text.secondary }]}
            numberOfLines={2}
          >
            {text2}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <CustomToast
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
      type="success"
    />
  ),
  error: (props) => (
    <CustomToast
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
      type="error"
    />
  ),
  info: (props) => (
    <CustomToast
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
      type="info"
    />
  ),
};
