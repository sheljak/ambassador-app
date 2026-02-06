import React, { useMemo } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

const TextFeed: React.FC<BaseFeedProps> = ({ data, onPress }) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();

  // Extract prospect name from extraData
  const prospectName = useMemo(() => {
    const prospect = data.extraData?.prospect;
    if (prospect?.name) {
      const name = prospect.name.split(' ')[0];
      return name.length > 15 ? name.substring(0, 12) + '...' : name;
    }
    return 'prospect';
  }, [data.extraData]);

  // Get message text
  const messageText = useMemo(() => {
    if (data.text) return data.text;
    if (typeof data.content === 'string') return data.content;
    if (typeof data.content === 'object' && data.content?.text) {
      return data.content.text;
    }
    return `Started chatting with ${prospectName}`;
  }, [data.text, data.content, prospectName]);

  return (
    <FeedCard data={data} onPress={onPress} label="Chat" labelColor={palette.success[500]}>
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: colors.background.tertiary,
            borderRadius: shapes.radius.md,
          },
        ]}
      >
        <ThemedText style={[styles.messageText, { color: colors.text.primary }]}>
          {messageText}
        </ThemedText>
      </View>
    </FeedCard>
  );
};

const useStyles = createStyles(({ spacing, typography }) => ({
  messageContainer: {
    padding: spacing.sm * 1.5,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
}));

export default React.memo(TextFeed);
