import React from 'react';
import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import type { FeedType } from '@/store/features/feeds/types';

export interface FeedHeaderProps {
  selectedType: FeedType;
  onTypeChange: (type: FeedType) => void;
}

const FEED_OPTIONS: { type: FeedType; label: string }[] = [
  { type: 'all', label: 'All Feeds' },
  { type: 'my', label: 'My Feeds' },
];

const FeedHeader: React.FC<FeedHeaderProps> = ({ selectedType, onTypeChange }) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border.default }]}>
      {/* Button Toggler */}
      <View style={styles.buttonContainer}>
        {FEED_OPTIONS.map(({ type, label }) => {
          const isSelected = selectedType === type;
          return (
            <Pressable
              key={type}
              onPress={() => onTypeChange(type)}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: isSelected
                    ? palette.primary[500]
                    : pressed
                    ? palette.neutral[200]
                    : colors.background.secondary,
                  borderColor: isSelected ? palette.primary[500] : palette.neutral[300],
                  borderRadius: shapes.radius.md,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.buttonText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text.secondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm * 1.5,
  },
  button: {
    paddingVertical: spacing.xs * 2.5,
    paddingHorizontal: spacing.xs * 5,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
  },
}));

export default React.memo(FeedHeader);
