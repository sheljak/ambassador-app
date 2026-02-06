import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useSelector } from 'react-redux';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Loader } from '@/components/Loader';
import { useTheme, createStyles, spacing as spacingTokens } from '@/theme';
import { useLazyGetLeaderboardQuery } from '@/store/features/leaderboard';
import { prepareSubjectInfo } from '@/helpers/common';
import type { LeaderboardAmbassador } from '@/store/types_that_will_used';
import type { RootState } from '@/store';

const LEADERBOARD_LIMIT = 200; // API returns all at once
const DISPLAY_BATCH = 20; // Show items in batches for smooth scrolling
const ITEM_HEIGHT = spacingTokens.xs * 18; // Fixed height for getItemLayout

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  leadersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  leaderContainer: {
    alignItems: 'center',
    width: spacing.xs * 25,
  },
  pointsText: {
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontWeight: typography.fontWeight.semibold,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -spacing.xs,
    right: -spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: spacing.xs / 2,
  },
  rankText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  leaderName: {
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  subjectText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  ambassadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm * 1.5,
    marginBottom: spacing.sm,
    height: ITEM_HEIGHT,
  },
  ambassadorRank: {
    width: spacing.xs * 8,
    height: spacing.xs * 8,
    borderRadius: shapes.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm * 1.5,
  },
  ambassadorRankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  ambassadorAvatar: {
    width: spacing.xs * 10,
    height: spacing.xs * 10,
    borderRadius: shapes.radius.full,
    marginRight: spacing.sm * 1.5,
  },
  ambassadorAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambassadorInfo: {
    flex: 1,
  },
  ambassadorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  ambassadorSubject: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  ambassadorPoints: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
  currentAmbassadorSection: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
  },
}));

type Styles = ReturnType<typeof useStyles>;

// Memoized Ambassador Card Component
interface AmbassadorCardProps {
  item: LeaderboardAmbassador;
  colors: any;
  shapes: any;
  palette: any;
  styles: Styles;
}

const AmbassadorCard = memo<AmbassadorCardProps>(({ item, colors, shapes, palette, styles }) => {
  const subjectInfo = prepareSubjectInfo(item);

  return (
    <View
      style={[
        styles.ambassadorCard,
        {
          backgroundColor: colors.background.secondary,
          borderRadius: shapes.radius.md,
          borderWidth: 1,
          borderColor: item.isCurrentAmbassador
            ? palette.primary[500]
            : colors.border.default,
        },
      ]}
    >
      <View
        style={[
          styles.ambassadorRank,
          {
            backgroundColor: item.isCurrentAmbassador
              ? palette.primary[500]
              : palette.neutral[200],
          },
        ]}
      >
        <ThemedText
          style={[
            styles.ambassadorRankText,
            {
              color: item.isCurrentAmbassador ? '#FFFFFF' : colors.text.primary,
            },
          ]}
        >
          {item.index}
        </ThemedText>
      </View>
      {item.avatar ? (
        <Image
          source={{ uri: item.avatar }}
          style={styles.ambassadorAvatar}
          recyclingKey={`avatar-${item.id}`}
        />
      ) : (
        <View
          style={[
            styles.ambassadorAvatar,
            styles.ambassadorAvatarPlaceholder,
            { backgroundColor: palette.primary[100] },
          ]}
        >
          <ThemedText style={{ color: palette.primary[600], fontSize: 14 }}>
            {item.name?.charAt(0).toUpperCase() || '?'}
          </ThemedText>
        </View>
      )}
      <View style={styles.ambassadorInfo}>
        <ThemedText
          style={[styles.ambassadorName, { color: colors.text.primary }]}
          numberOfLines={1}
        >
          {item.name} {item.last_name}
        </ThemedText>
        {subjectInfo ? (
          <ThemedText
            style={[styles.ambassadorSubject, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {subjectInfo}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText style={[styles.ambassadorPoints, { color: palette.primary[500] }]}>
        {item.user_points}
      </ThemedText>
    </View>
  );
});

AmbassadorCard.displayName = 'AmbassadorCard';

// Memoized Leader Card Component
interface LeaderCardProps {
  ambassador: LeaderboardAmbassador;
  isFirst: boolean;
  colors: any;
  palette: any;
  styles: Styles;
}

const LeaderCard = memo<LeaderCardProps>(({ ambassador, isFirst, colors, palette, styles }) => {
  const avatarSize = isFirst ? 80 : 64;
  const badgeSize = isFirst ? 28 : 24;
  const marginTop = isFirst ? 0 : 24;
  const subjectInfo = prepareSubjectInfo(ambassador);

  const badgeColor =
    ambassador.index === 1
      ? '#FFD700'
      : ambassador.index === 2
      ? '#C0C0C0'
      : '#CD7F32';

  return (
    <View style={[styles.leaderContainer, { marginTop }]}>
      <ThemedText
        style={[
          styles.pointsText,
          { color: palette.primary[500], fontSize: isFirst ? 18 : 14 },
        ]}
      >
        {ambassador.user_points}
      </ThemedText>
      <View style={[styles.avatarContainer, { width: avatarSize, height: avatarSize }]}>
        {ambassador.avatar ? (
          <Image
            source={{ uri: ambassador.avatar }}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                borderColor: isFirst ? palette.primary[500] : colors.border.default,
                borderWidth: isFirst ? 3 : 2,
              },
            ]}
            recyclingKey={`leader-${ambassador.id}`}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: palette.primary[100],
              },
            ]}
          >
            <ThemedText
              style={[
                styles.avatarInitial,
                { color: palette.primary[600], fontSize: isFirst ? 28 : 22 },
              ]}
            >
              {ambassador.name?.charAt(0).toUpperCase() || '?'}
            </ThemedText>
          </View>
        )}
        <View
          style={[
            styles.rankBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
            },
          ]}
        >
          <ThemedText style={styles.rankText}>{ambassador.index}</ThemedText>
        </View>
      </View>
      <ThemedText
        style={[
          styles.leaderName,
          {
            color: ambassador.isCurrentAmbassador
              ? palette.primary[500]
              : colors.text.primary,
            fontSize: isFirst ? 14 : 12,
          },
        ]}
        numberOfLines={1}
      >
        {ambassador.name}
      </ThemedText>
      {subjectInfo ? (
        <ThemedText
          style={[styles.subjectText, { color: colors.text.secondary }]}
          numberOfLines={1}
        >
          {subjectInfo}
        </ThemedText>
      ) : null}
    </View>
  );
});

LeaderCard.displayName = 'LeaderCard';

export default function LeaderboardScreen() {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const currentUserIdRef = useRef(currentUserId);

  // Keep ref in sync
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const [leaders, setLeaders] = useState<LeaderboardAmbassador[]>([]);
  const [allNextLeaders, setAllNextLeaders] = useState<LeaderboardAmbassador[]>([]);
  const [displayCount, setDisplayCount] = useState(DISPLAY_BATCH);
  const [currentAmbassador, setCurrentAmbassador] = useState<LeaderboardAmbassador | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [fetchLeaderboard, { isLoading }] = useLazyGetLeaderboardQuery();

  // Only show items up to displayCount for smooth scrolling
  const nextLeaders = useMemo(
    () => allNextLeaders.slice(0, displayCount),
    [allNextLeaders, displayCount]
  );

  // Load leaderboard data
  const loadLeaderboard = useCallback(
    async (leaderboardOffset = 0, _append = false) => {
      try {
        const result = await fetchLeaderboard({
          offset: leaderboardOffset,
          limit: LEADERBOARD_LIMIT,
        }).unwrap();

        if (result.success && result.data) {
          const allAmbassadors = result.data.ambassadorData || [];
          // Mark current ambassador (use ref to avoid dependency on currentUserId)
          const marked = allAmbassadors.map((amb) => ({
            ...amb,
            isCurrentAmbassador: amb.id === currentUserIdRef.current,
          }));

          // Top 3 leaders
          const top3 = marked.filter((amb) => amb.index <= 3);
          const sortedTop3 = [
            top3.find((a) => a.index === 2),
            top3.find((a) => a.index === 1),
            top3.find((a) => a.index === 3),
          ].filter(Boolean) as LeaderboardAmbassador[];

          setLeaders(sortedTop3);
          setAllNextLeaders(marked.filter((amb) => amb.index > 3));
          setDisplayCount(DISPLAY_BATCH);

          // Find current ambassador if outside top list
          const current = marked.find((amb) => amb.isCurrentAmbassador);
          if (current && current.index > 3) {
            setCurrentAmbassador(current);
          } else {
            setCurrentAmbassador(null);
          }
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchLeaderboard]
  );

  // Initial load
  useEffect(() => {
    loadLeaderboard(0, false);
  }, [loadLeaderboard]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLeaders([]);
    setAllNextLeaders([]);
    setDisplayCount(DISPLAY_BATCH);
    loadLeaderboard(0, false);
  }, [loadLeaderboard]);

  // Handle load more — just reveal more from the already loaded data
  const handleLoadMore = useCallback(() => {
    if (displayCount < allNextLeaders.length) {
      setDisplayCount((prev) => Math.min(prev + DISPLAY_BATCH, allNextLeaders.length));
    }
  }, [displayCount, allNextLeaders.length]);

  // Render item - memoized
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LeaderboardAmbassador>) => (
      <AmbassadorCard
        item={item}
        colors={colors}
        shapes={shapes}
        palette={palette}
        styles={styles}
      />
    ),
    [colors, shapes, palette, styles]
  );

  // Key extractor
  const keyExtractor = useCallback((item: LeaderboardAmbassador) => String(item.id), []);

  // Get item layout for fixed height items
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // List header with top 3
  const ListHeader = useMemo(() => {
    if (leaders.length === 0 && isLoading) {
      return null;
    }

    const secondPlace = leaders.find((l) => l.index === 2);
    const firstPlace = leaders.find((l) => l.index === 1);
    const thirdPlace = leaders.find((l) => l.index === 3);

    return (
      <View>
        {leaders.length > 0 && (
          <View style={styles.leadersContainer}>
            {secondPlace && (
              <LeaderCard
                ambassador={secondPlace}
                isFirst={false}
                colors={colors}
                palette={palette}
                styles={styles}
              />
            )}
            {firstPlace && (
              <LeaderCard
                ambassador={firstPlace}
                isFirst={true}
                colors={colors}
                palette={palette}
                styles={styles}
              />
            )}
            {thirdPlace && (
              <LeaderCard
                ambassador={thirdPlace}
                isFirst={false}
                colors={colors}
                palette={palette}
                styles={styles}
              />
            )}
          </View>
        )}
      </View>
    );
  }, [leaders, isLoading, colors, palette, styles]);

  const hasMore = displayCount < allNextLeaders.length;

  // List footer
  const ListFooter = useMemo(() => {
    const showCurrentAmbassador =
      currentAmbassador &&
      currentAmbassador.index > 3 &&
      !nextLeaders.some((l) => l.id === currentAmbassador.id);

    return (
      <>
        {showCurrentAmbassador && (
          <View style={styles.currentAmbassadorSection}>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <AmbassadorCard
              item={currentAmbassador}
              colors={colors}
              shapes={shapes}
              palette={palette}
              styles={styles}
            />
          </View>
        )}
        {hasMore && (
          <View style={styles.footerLoader}>
            <Loader size="small" inline />
          </View>
        )}
      </>
    );
  }, [currentAmbassador, nextLeaders, hasMore, colors, shapes, palette, styles]);

  // Empty state
  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Loader size="large" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyEmoji}>🏆</ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.text.secondary }]}>
          No leaderboard data available yet.
        </ThemedText>
      </View>
    );
  }, [isLoading, colors, styles]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <ThemedText type="title">Leaderboard</ThemedText>
      </View>

      <FlatList
        data={nextLeaders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={leaders.length === 0 ? ListEmpty : null}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary[500]}
            colors={[palette.primary[500]]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </ThemedView>
  );
}
