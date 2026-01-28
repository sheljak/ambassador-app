import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import type { BaseFeedProps } from './types';

const SystemFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();

  const messageText = useMemo(() => {
    if (data.text) return data.text;
    if (typeof data.content === 'string') return data.content;
    if (typeof data.content === 'object' && data.content?.text) {
      return data.content.text;
    }
    return 'System notification';
  }, [data.text, data.content]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.neutral[100],
          borderRadius: shapes.radius.md,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: palette.neutral[300] }]}>
        <ThemedText style={styles.icon}>i</ThemedText>
      </View>
      <ThemedText style={[styles.text, { color: colors.text.secondary }]}>
        {messageText}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default React.memo(SystemFeed);
