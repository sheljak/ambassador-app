import React, { memo, useRef, useCallback } from 'react';
import { View, TextInput, Pressable, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, createStyles } from '@/theme';

interface MessagesSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const MessagesSearch: React.FC<MessagesSearchProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search messages...',
}) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    onClear();
    inputRef.current?.blur();
  }, [onClear]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background.secondary,
            borderRadius: shapes.radius.md,
            borderColor: colors.border.default,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value ? (
          <Pressable style={styles.iconButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color={palette.primary[500]} />
          </Pressable>
        ) : (
          <Pressable style={styles.iconButton} onPress={handleFocus}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: spacing.sm * 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.xs * 2.5,
    fontSize: typography.fontSize.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
}));

export default memo(MessagesSearch);
