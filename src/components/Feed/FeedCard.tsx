import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import type { FeedPost } from '@/store/types_that_will_used';

interface FeedCardProps {
  data: FeedPost;
  onPress?: () => void;
  children: React.ReactNode;
  label?: string;
  labelColor?: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
  data,
  onPress,
  children,
  label,
  labelColor,
}) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();

  const user = data.user;
  const avatarUrl = user?.avatar?.original || user?.avatar?.sizes?.['70x70'];

  const userName = useMemo(() => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user?.name || 'Unknown User';
  }, [user]);

  const formattedDate = useMemo(() => {
    if (!data.created_at) return '';
    const date = new Date(data.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [data.created_at]);

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: colors.background.secondary,
            borderRadius: shapes.radius.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[
                styles.avatar,
                { backgroundColor: palette.neutral[200], borderRadius: shapes.radius.full },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: palette.primary[100], borderRadius: shapes.radius.full },
              ]}
            >
              <ThemedText style={[styles.avatarInitial, { color: palette.primary[600] }]}>
                {userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text.primary }}>
                {userName}
              </ThemedText>
              {label && (
                <View
                  style={[
                    styles.labelBadge,
                    { backgroundColor: labelColor || palette.primary[500] },
                  ]}
                >
                  <ThemedText style={styles.labelText}>{label}</ThemedText>
                </View>
              )}
            </View>
            {formattedDate && (
              <ThemedText style={[styles.date, { color: colors.text.disabled }]}>
                {formattedDate}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </ThemedView>
    </Pressable>
  );
};

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm * 1.5,
  },
  avatar: {
    width: spacing.xs * 10,
    height: spacing.xs * 10,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarInitial: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
  },
  headerText: {
    marginLeft: spacing.sm * 1.5,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  labelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: shapes.radius.sm,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  content: {},
}));

export default React.memo(FeedCard);
