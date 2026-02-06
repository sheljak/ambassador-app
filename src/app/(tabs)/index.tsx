import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  View,
  RefreshControl,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FeedItem, FeedHeader } from '@/components/Feed';
import { Loader } from '@/components/Loader';
import { useTheme, createStyles } from '@/theme';
import { useLazyGetFeedsQuery } from '@/store/features/feeds';
import type { FeedType } from '@/store/features/feeds/types';
import type { FeedPost } from '@/store/types_that_will_used';
import type { RootState } from '@/store';

const FEED_LIMIT = 10;

export default function HomeScreen() {
  const { colors, palette } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Get current user ID from Redux
  const currentUser = useSelector((state: RootState) => state.auth.user?.id);

  const [selectedType, setSelectedType] = useState<FeedType>('all');
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [fetchFeeds, { isLoading, isFetching }] = useLazyGetFeedsQuery();

  // Convert selectedType to selectedIndex (0 = all, 1 = my)
  const selectedIndex = useMemo(() => (selectedType === 'all' ? 0 : 1), [selectedType]);

  // Load feeds
  const loadFeeds = useCallback(
    async (type: FeedType, feedOffset = 0, append = false) => {
      try {
        const result = await fetchFeeds({
          type,
          offset: feedOffset,
          limit: FEED_LIMIT,
        }).unwrap();

        if (result.success && result.data) {
          const newItems = result.data.feed || [];
          const newTotal = result.data.total || 0;

          if (append) {
            setFeeds((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const uniqueItems = newItems.filter((item) => !existingIds.has(item.id));
              return [...prev, ...uniqueItems];
            });
          } else {
            setFeeds(newItems);
          }

          setOffset(feedOffset);
          setTotal(newTotal);
        }
      } catch (error) {
        console.error('Failed to load feeds:', error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchFeeds]
  );

  // Initial load and type change
  useEffect(() => {
    setFeeds([]);
    setOffset(0);
    loadFeeds(selectedType, 0, false);
  }, [selectedType, loadFeeds]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadFeeds(selectedType, 0, false);
  }, [selectedType, loadFeeds]);

  // Handle load more (pagination)
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isFetching && feeds.length < total) {
      loadFeeds(selectedType, offset + FEED_LIMIT, true);
    }
  }, [isLoading, isFetching, feeds.length, total, selectedType, offset, loadFeeds]);

  // Handle feed type change
  const handleTypeChange = useCallback((type: FeedType) => {
    setSelectedType(type);
  }, []);

  // Handle add answer button press
  const handleAddAnswer = useCallback((feedData: FeedPost) => {
    // Navigate to chat/dialog to add answer
    const dialog = feedData.extraData?.dialog;
    if (dialog) {
      // TODO: Navigate to chat screen with dialog
      console.log('Navigate to add answer for dialog:', dialog);
    }
  }, []);

  // Render feed item
  const renderItem: ListRenderItem<FeedPost> = useCallback(
    ({ item }) => (
      <FeedItem
        data={item}
        selectedIndex={selectedIndex}
        currentUser={currentUser}
        onAddAnswer={handleAddAnswer}
      />
    ),
    [selectedIndex, currentUser, handleAddAnswer]
  );

  // Key extractor
  const keyExtractor = useCallback((item: FeedPost) => String(item.id), []);

  // Empty component
  const ListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Loader size="large" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.emptyText, { color: colors.text.secondary }]}>
          {selectedType === 'my'
            ? "You haven't created any posts yet."
            : 'No feeds available at the moment.'}
        </ThemedText>
      </View>
    );
  }, [isLoading, colors, selectedType, styles]);

  // Footer component (loading indicator for pagination)
  const ListFooter = useCallback(() => {
    if (!isFetching || feeds.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <Loader size="small" inline />
      </View>
    );
  }, [isFetching, feeds.length, styles]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background.primary }]}>
        <FeedHeader selectedType={selectedType} onTypeChange={handleTypeChange} />
      </View>

      {/* Feed List */}
      <FlatList
        data={feeds}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
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
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={FEED_LIMIT}
        maxToRenderPerBatch={FEED_LIMIT}
      />
    </ThemedView>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    flex: 1,
  },
  stickyHeader: {
    zIndex: 10,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
}));
