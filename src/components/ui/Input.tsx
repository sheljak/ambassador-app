/**
 * Reusable Input Component
 * Themed text input with label, error state, and icon support
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  Text,
} from 'react-native';
import { useTheme, createStyles } from '@/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: object;
  inputStyle?: object;
  // For password fields
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      disabled = false,
      containerStyle,
      inputStyle,
      secureTextEntry,
      showPasswordToggle = false,
      ...textInputProps
    },
    ref
  ) => {
    const { colors, shapes, spacing } = useTheme();
    const styles = useStyles();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = !!error;
    const isSecure = secureTextEntry && !isPasswordVisible;

    const getBorderColor = () => {
      if (hasError) return colors.status.error;
      if (isFocused) return colors.interactive.default;
      return colors.border.default;
    };

    const handleTogglePassword = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && (
          <Text
            style={[
              styles.label,
              { color: hasError ? colors.status.error : colors.text.secondary },
            ]}
          >
            {label}
          </Text>
        )}

        {/* Input wrapper */}
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: disabled
                ? colors.background.tertiary
                : colors.background.secondary,
              borderColor: getBorderColor(),
              borderRadius: shapes.radius.md,
            },
          ]}
        >
          {/* Left icon */}
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          {/* Text input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: disabled ? colors.text.disabled : colors.text.primary,
                paddingLeft: leftIcon ? 0 : spacing.md,
                paddingRight: rightIcon || (secureTextEntry && showPasswordToggle) ? 0 : spacing.md,
              },
              inputStyle,
            ]}
            placeholderTextColor={colors.text.disabled}
            editable={!disabled}
            secureTextEntry={isSecure}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            {...textInputProps}
          />

          {/* Password toggle */}
          {secureTextEntry && showPasswordToggle && (
            <Pressable
              onPress={handleTogglePassword}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          )}

          {/* Right icon (if no password toggle) */}
          {rightIcon && !(secureTextEntry && showPasswordToggle) && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>

        {/* Error message */}
        {hasError && (
          <Text style={[styles.error, { color: colors.status.error }]}>
            {error}
          </Text>
        )}

        {/* Hint text */}
        {hint && !hasError && (
          <Text style={[styles.hint, { color: colors.text.secondary }]}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: spacing.xs * 12,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.sm * 1.5,
  },
  leftIcon: {
    paddingLeft: spacing.sm * 1.5,
    paddingRight: spacing.sm,
  },
  rightIcon: {
    paddingRight: spacing.sm * 1.5,
    paddingLeft: spacing.sm,
  },
  error: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
}));
