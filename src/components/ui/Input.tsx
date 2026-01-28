/**
 * Reusable Input Component
 * Themed text input with label, error state, and icon support
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';

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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
