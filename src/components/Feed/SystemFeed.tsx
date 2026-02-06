import React, { useMemo } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import type { BaseFeedProps } from './types';

const SystemFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();

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

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm * 1.5,
    marginBottom: spacing.sm * 1.5,
    gap: spacing.sm * 1.5,
  },
  iconContainer: {
    width: spacing.xs * 6,
    height: spacing.xs * 6,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
}));

export default React.memo(SystemFeed);
