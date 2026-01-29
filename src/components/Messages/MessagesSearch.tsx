import React, { memo, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
  },
});

export default memo(MessagesSearch);
