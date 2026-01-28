import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/theme';
import type { FeedPost } from '@/store/types_that_will_used';

export interface LeadersFeedProps {
  data: FeedPost;
  selectedIndex: number;
  currentUser?: string | number;
}

interface Ambassador {
  id: string | number;
  name: string;
  avatar?: string;
  index: number;
  user_points?: number;
  user_tags?: {
    profile?: Array<{ key: string }>;
    subject?: Array<{ name: string }>;
  };
}

const getMedalColor = (position: number): string => {
  switch (position) {
    case 1:
      return '#E3B63C'; // Gold
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return '#E3B63C';
  }
};

const getMedalEmoji = (position: number): string => {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '🏅';
  }
};

interface AmbassadorCardProps {
  item: Ambassador;
  isCurrentUser: boolean;
  isMyFeed: boolean;
}

const AmbassadorCard: React.FC<AmbassadorCardProps> = React.memo(
  ({ item, isCurrentUser, isMyFeed }) => {
    const { colors, shapes, palette } = useTheme();

    const avatarUrl = typeof item.avatar === 'string' ? item.avatar : null;
    const nameColor = isCurrentUser && isMyFeed ? palette.primary[500] : colors.text.primary;
    const medalColor = getMedalColor(item.index);

    return (
      <View
        style={[
          styles.ambassadorCard,
          {
            backgroundColor: isCurrentUser ? palette.primary[50] : colors.background.tertiary,
            borderRadius: shapes.radius.md,
          },
        ]}
      >
        {/* Medal */}
        <View style={[styles.medalContainer, { backgroundColor: medalColor }]}>
          <ThemedText style={styles.medalText}>{item.index}</ThemedText>
        </View>

        {/* Avatar */}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: palette.neutral[200] }]}>
            <ThemedText style={{ color: palette.neutral[500], fontWeight: '600' }}>
              {item.name?.charAt(0).toUpperCase() || '?'}
            </ThemedText>
          </View>
        )}

        {/* Info */}
        <View style={styles.ambassadorInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={[styles.ambassadorName, { color: nameColor }]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.points, { color: palette.primary[500] }]}>
              {item.user_points} pts
            </ThemedText>
          </View>
          {item.user_tags?.subject?.[0]?.name && (
            <ThemedText style={[styles.subject, { color: colors.text.disabled }]}>
              {item.user_tags.subject[0].name}
            </ThemedText>
          )}
        </View>

        {/* Medal emoji */}
        <ThemedText style={styles.medalEmoji}>{getMedalEmoji(item.index)}</ThemedText>
      </View>
    );
  }
);

const LeadersFeed: React.FC<LeadersFeedProps> = ({ data, selectedIndex, currentUser }) => {
  const { colors, shapes, palette } = useTheme();
  const isMyFeed = selectedIndex === 1;

  // Get month name
  const month = useMemo(() => {
    if (!data.created_at) return 'the month';
    const date = new Date(data.created_at);
    date.setMonth(date.getMonth() - 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  }, [data.created_at]);

  // Get formatted date
  const formattedDate = useMemo(() => {
    if (!data.created_at) return '';
    const date = new Date(data.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return 'today';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [data.created_at]);

  // Get ambassadors list
  const ambassadors = useMemo(() => {
    return (data.extraData?.ambassadors as Ambassador[]) || [];
  }, [data.extraData?.ambassadors]);

  const congratsMessage = isMyFeed
    ? "Congratulations! You're in the top 3 ambassadors for this month!"
    : 'Congratulations to the top ambassadors of this month:';

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: colors.background.secondary, borderRadius: shapes.radius.lg },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.trophyContainer, { backgroundColor: palette.primary[500] }]}>
            <ThemedText style={styles.trophyEmoji}>🏆</ThemedText>
          </View>
          <View>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text.primary }}>
              Leaders of {month}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text.disabled }]}>
              Top 3 most active ambassadors
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.time, { color: colors.text.disabled }]}>
          {formattedDate}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={[styles.message, { color: colors.text.secondary }]}>
          {congratsMessage}
        </ThemedText>

        {/* Ambassador Cards */}
        <View style={styles.ambassadorsList}>
          {ambassadors.map((item, index) => (
            <AmbassadorCard
              key={item.id || index}
              item={{ ...item, index: item.index || index + 1 }}
              isCurrentUser={item.id === currentUser}
              isMyFeed={isMyFeed}
            />
          ))}
        </View>

        <ThemedText style={[styles.wellDone, { color: palette.primary[500] }]}>
          Well done! 🎉
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyEmoji: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
  },
  ambassadorsList: {
    gap: 8,
  },
  ambassadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  medalContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambassadorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ambassadorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  points: {
    fontSize: 12,
    fontWeight: '500',
  },
  subject: {
    fontSize: 12,
    marginTop: 2,
  },
  medalEmoji: {
    fontSize: 20,
  },
  wellDone: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default React.memo(LeadersFeed);
