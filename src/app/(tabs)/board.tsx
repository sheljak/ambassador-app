import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useSelector } from 'react-redux';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import { useLazyGetLeaderboardQuery } from '@/store/features/leaderboard';
import { prepareSubjectInfo } from '@/helpers/common';
import type { LeaderboardAmbassador } from '@/store/types_that_will_used';
import type { RootState } from '@/store';

const LEADERBOARD_LIMIT = 20;

export default function LeaderboardScreen() {
  const { colors, shapes, palette } = useTheme();
  const insets = useSafeAreaInsets();

  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const currentUserIdRef = useRef(currentUserId);

  // Keep ref in sync
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const [leaders, setLeaders] = useState<LeaderboardAmbassador[]>([]);
  const [nextLeaders, setNextLeaders] = useState<LeaderboardAmbassador[]>([]);
  const [currentAmbassador, setCurrentAmbassador] = useState<LeaderboardAmbassador | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [fetchLeaderboard, { isLoading, isFetching }] = useLazyGetLeaderboardQuery();

  // Load leaderboard data
  const loadLeaderboard = useCallback(
    async (leaderboardOffset = 0, append = false) => {
      try {
        const result = await fetchLeaderboard({
          offset: leaderboardOffset,
          limit: LEADERBOARD_LIMIT,
        }).unwrap();

        if (result.success && result.data) {
          const allAmbassadors = result.data.ambassadorData || [];
          const newTotal = result.data.total || 0;

          // Mark current ambassador (use ref to avoid dependency on currentUserId)
          const marked = allAmbassadors.map((amb) => ({
            ...amb,
            isCurrentAmbassador: amb.id === currentUserIdRef.current,
          }));

          if (append) {
            // Append to existing list
            setNextLeaders((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const uniqueItems = marked
                .filter((item) => item.index > 3)
                .filter((item) => !existingIds.has(item.id));
              return [...prev, ...uniqueItems];
            });
          } else {
            // Top 3 leaders
            const top3 = marked.filter((amb) => amb.index <= 3);
            // Sort so index 2 is first, then 1, then 3 (for podium layout)
            const sortedTop3 = [
              top3.find((a) => a.index === 2),
              top3.find((a) => a.index === 1),
              top3.find((a) => a.index === 3),
            ].filter(Boolean) as LeaderboardAmbassador[];

            setLeaders(sortedTop3);
            setNextLeaders(marked.filter((amb) => amb.index > 3));

            // Find current ambassador if outside top list
            const current = marked.find((amb) => amb.isCurrentAmbassador);
            if (current && current.index > 3) {
              setCurrentAmbassador(current);
            } else {
              setCurrentAmbassador(null);
            }
          }

          setOffset(leaderboardOffset);
          setTotal(newTotal);
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
    setNextLeaders([]);
    setOffset(0);
    loadLeaderboard(0, false);
  }, [loadLeaderboard]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isFetching && nextLeaders.length + 3 < total) {
      loadLeaderboard(offset + LEADERBOARD_LIMIT, true);
    }
  }, [isLoading, isFetching, nextLeaders.length, total, offset, loadLeaderboard]);

  // Render top 3 leader
  const renderLeader = useCallback(
    (ambassador: LeaderboardAmbassador, isFirst: boolean) => {
      const avatarSize = isFirst ? 80 : 64;
      const badgeSize = isFirst ? 28 : 24;
      const marginTop = isFirst ? 0 : 24;

      return (
        <View
          key={ambassador.id}
          style={[styles.leaderContainer, { marginTop }]}
        >
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
                  backgroundColor:
                    ambassador.index === 1
                      ? '#FFD700'
                      : ambassador.index === 2
                      ? '#C0C0C0'
                      : '#CD7F32',
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
          {prepareSubjectInfo(ambassador) ? (
            <ThemedText
              style={[styles.subjectText, { color: colors.text.secondary }]}
              numberOfLines={1}
            >
              {prepareSubjectInfo(ambassador)}
            </ThemedText>
          ) : null}
        </View>
      );
    },
    [colors, palette]
  );

  // Render ambassador card for the list
  const renderAmbassadorCard: ListRenderItem<LeaderboardAmbassador> = useCallback(
    ({ item, index }) => {
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
              style={[styles.ambassadorAvatar, { borderRadius: 20 }]}
            />
          ) : (
            <View
              style={[
                styles.ambassadorAvatar,
                styles.ambassadorAvatarPlaceholder,
                { backgroundColor: palette.primary[100], borderRadius: 20 },
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
            {prepareSubjectInfo(item) ? (
              <ThemedText
                style={[styles.ambassadorSubject, { color: colors.text.secondary }]}
                numberOfLines={1}
              >
                {prepareSubjectInfo(item)}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText style={[styles.ambassadorPoints, { color: palette.primary[500] }]}>
            {item.user_points}
          </ThemedText>
        </View>
      );
    },
    [colors, shapes, palette]
  );

  // Key extractor
  const keyExtractor = useCallback((item: LeaderboardAmbassador) => String(item.id), []);

  // List header with top 3
  const ListHeader = useMemo(() => {
    if (leaders.length === 0 && isLoading) {
      return null;
    }

    // Get leaders by position (layout: 2nd, 1st, 3rd)
    const secondPlace = leaders.find((l) => l.index === 2);
    const firstPlace = leaders.find((l) => l.index === 1);
    const thirdPlace = leaders.find((l) => l.index === 3);

    return (
      <View>
        {/* Top 3 Leaders */}
        {leaders.length > 0 && (
          <View style={styles.leadersContainer}>
            {secondPlace && renderLeader(secondPlace, false)}
            {firstPlace && renderLeader(firstPlace, true)}
            {thirdPlace && renderLeader(thirdPlace, false)}
          </View>
        )}
      </View>
    );
  }, [leaders, isLoading, renderLeader]);

  // List footer
  const ListFooter = useCallback(() => {
    // Show current ambassador if they're outside the visible list
    const showCurrentAmbassador =
      currentAmbassador &&
      currentAmbassador.index > 3 &&
      !nextLeaders.some((l) => l.id === currentAmbassador.id);

    return (
      <>
        {showCurrentAmbassador && (
          <View style={styles.currentAmbassadorSection}>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            {renderAmbassadorCard({
              item: currentAmbassador,
              index: 0,
              separators: {
                highlight: () => {},
                unhighlight: () => {},
                updateProps: () => {},
              },
            })}
          </View>
        )}
        {isFetching && nextLeaders.length > 0 && (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={palette.primary[500]} />
          </View>
        )}
      </>
    );
  }, [currentAmbassador, nextLeaders, isFetching, colors, palette, renderAmbassadorCard]);

  // Empty state
  const ListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={palette.primary[500]} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.emptyEmoji]}>🏆</ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.text.secondary }]}>
          No leaderboard data available yet.
        </ThemedText>
      </View>
    );
  }, [isLoading, colors, palette]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <ThemedText type="title">Leaderboard</ThemedText>
      </View>

      <FlatList
        data={nextLeaders}
        renderItem={renderAmbassadorCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={leaders.length === 0 ? ListEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary[500]}
            colors={[palette.primary[500]]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  leadersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  leaderContainer: {
    alignItems: 'center',
    width: 100,
  },
  pointsText: {
    fontWeight: '700',
    marginBottom: 8,
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
    fontWeight: '600',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  leaderName: {
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  subjectText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  ambassadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  ambassadorRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ambassadorRankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ambassadorAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  ambassadorAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambassadorInfo: {
    flex: 1,
  },
  ambassadorName: {
    fontSize: 15,
    fontWeight: '500',
  },
  ambassadorSubject: {
    fontSize: 12,
    marginTop: 2,
  },
  ambassadorPoints: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  currentAmbassadorSection: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
