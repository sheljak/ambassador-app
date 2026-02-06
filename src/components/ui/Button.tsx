/**
 * Reusable Button Component
 * Themed button with multiple variants and states
 */

import React from 'react';
import {
  Pressable,
  Text,
  PressableProps,
  View,
} from 'react-native';
import { useTheme, createStyles } from '@/theme';
import { Loader } from '@/components/Loader';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: object;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  ...pressableProps
}: ButtonProps) {
  const { colors, shapes, spacing } = useTheme();
  const styles = useStyles();

  const isDisabled = disabled || loading;

  const getBackgroundColor = (pressed: boolean) => {
    if (isDisabled) {
      return variant === 'outline' || variant === 'ghost'
        ? 'transparent'
        : colors.interactive.disabled;
    }

    switch (variant) {
      case 'primary':
        return pressed ? colors.interactive.pressed : colors.interactive.default;
      case 'secondary':
        return pressed ? colors.background.tertiary : colors.background.secondary;
      case 'outline':
      case 'ghost':
        return pressed ? colors.background.secondary : 'transparent';
      case 'danger':
        return pressed ? colors.status.error + 'CC' : colors.status.error;
      default:
        return colors.interactive.default;
    }
  };

  const getBorderColor = () => {
    if (isDisabled) {
      return variant === 'outline' ? colors.border.default : 'transparent';
    }

    switch (variant) {
      case 'outline':
        return colors.interactive.default;
      case 'danger':
        return colors.status.error;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (isDisabled) {
      return variant === 'outline' || variant === 'ghost' || variant === 'secondary'
        ? colors.text.disabled
        : colors.text.inverse;
    }

    switch (variant) {
      case 'primary':
        return colors.text.inverse;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
      case 'ghost':
        return colors.interactive.default;
      case 'danger':
        return colors.text.inverse;
      default:
        return colors.text.inverse;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return spacing.xs * 9;
      case 'md':
        return spacing.xs * 12;
      case 'lg':
        return spacing.xs * 14;
      default:
        return spacing.xs * 12;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return spacing.xs * 3.5;
      case 'md':
        return spacing.xs * 4;
      case 'lg':
        return spacing.xs * 4.5;
      default:
        return spacing.xs * 4;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderRadius: shapes.radius.lg,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          borderWidth: variant === 'outline' ? 1 : 0,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <Loader size="small" inline />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
}));
