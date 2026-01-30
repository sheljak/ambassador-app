import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDebouncedCallback } from 'use-debounce';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MessageItem, MessagesSearch, MessagesTabBar } from '@/components/Messages';
import { useTheme } from '@/theme';
import { useLazyGetDialogsQuery } from '@/store/features/dialogs/api';
import { useGetAccountQuery } from '@/store/features/auth/api';
import { useAppSelector } from '@/store';
import { getPusher, CHANNEL_NAMES } from '@/services/pusher';
import type { Dialog, ActivityTab } from '@/store/types_that_will_used';
import type { Channel } from 'pusher-js';

// Chat types for each tab
const CHAT_TYPES: Record<ActivityTab, string[]> = {
  chat: ['chat', 'group-chat', 'live-stream-chat', 'community-chat', 'community-1-to-1-chat'],
  content: ['content-group'],
  faq: ['faq'],
};

const LIMIT = 20;

interface TabCache {
  dialogs: Dialog[];
  total: number;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActivityTab>('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Per-tab cache to avoid re-fetching on tab switch
  const tabCacheRef = useRef<Record<string, TabCache>>({});

  // Current tab's dialogs in state (drives the FlatList)
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [total, setTotal] = useState(0);

  // Get account info with new messages counts
  const { data: accountData, refetch: refetchAccount } = useGetAccountQuery();
  const newMessages = accountData?.data?.newMessages;
  const userId = useAppSelector((state) => state.auth.user?.id);

  const [getDialogs, { isLoading, isFetching }] = useLazyGetDialogsQuery();

  const channelRef = useRef<Channel | null>(null);
  const userChannelRef = useRef<Channel | null>(null);

  // Cache key for current tab + search
  const cacheKey = useMemo(() => {
    const search = activeTab === 'chat' ? debouncedSearchTerm : '';
    return `${activeTab}:${search}`;
  }, [activeTab, debouncedSearchTerm]);

  // Tab data with unread counts
  const tabs = useMemo(() => [
    { key: 'chat' as const, label: 'Chat', count: newMessages?.newMessagesChat || 0 },
    { key: 'content' as const, label: 'Content', count: newMessages?.newMessagesContentGroup || 0 },
    { key: 'faq' as const, label: 'FAQ', count: newMessages?.newMessagesFAQ || 0 },
  ], [newMessages]);

  // Parse response helper
  const parseResponse = useCallback((result: Awaited<ReturnType<typeof getDialogs>>['data']) => {
    const list = result?.data?.dialogs ?? result?.data?.data ?? [];
    const count = result?.data?.total ?? result?.data?.meta?.total ?? 0;
    return { list, count };
  }, []);

  // Load first page of dialogs
  const loadDialogs = useCallback(async (forceRefresh = false) => {
    const key = cacheKey;

    // Use cache if available and not forcing refresh
    if (!forceRefresh && tabCacheRef.current[key]) {
      setDialogs(tabCacheRef.current[key].dialogs);
      setTotal(tabCacheRef.current[key].total);
      return;
    }

    try {
      const params: { types: string[]; offset: number; limit: number; search?: string } = {
        types: CHAT_TYPES[activeTab],
        offset: 0,
        limit: LIMIT,
      };
      if (debouncedSearchTerm && activeTab === 'chat') {
        params.search = debouncedSearchTerm;
      }

      const result = await getDialogs(params).unwrap();
      const { list, count } = parseResponse(result);

      tabCacheRef.current[key] = { dialogs: list, total: count };
      setDialogs(list);
      setTotal(count);
    } catch (error) {
      console.error('Failed to load dialogs:', error);
    }
  }, [cacheKey, activeTab, debouncedSearchTerm, getDialogs, parseResponse]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoadingMore || isFetching || dialogs.length >= total) return;

    setIsLoadingMore(true);
    try {
      const params: { types: string[]; offset: number; limit: number; search?: string } = {
        types: CHAT_TYPES[activeTab],
        offset: dialogs.length,
        limit: LIMIT,
      };
      if (debouncedSearchTerm && activeTab === 'chat') {
        params.search = debouncedSearchTerm;
      }

      const result = await getDialogs(params).unwrap();
      const { list, count } = parseResponse(result);

      const merged = [...dialogs, ...list];
      tabCacheRef.current[cacheKey] = { dialogs: merged, total: count };
      setDialogs(merged);
      setTotal(count);
    } catch (error) {
      console.error('Failed to load more dialogs:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isFetching, dialogs, total, activeTab, debouncedSearchTerm, cacheKey, getDialogs, parseResponse]);

  // Initial load & tab/search change
  useEffect(() => {
    loadDialogs(false);
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const debouncedSearch = useDebouncedCallback((search: string) => {
    setDebouncedSearchTerm(search);
  }, 500);

  const handleSearchChange = useCallback((text: string) => {
    setSearchTerm(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const handleTabChange = useCallback((tab: ActivityTab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const handleRefresh = useCallback(() => {
    loadDialogs(true);
  }, [loadDialogs]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleDialogPress = useCallback((dialog: Dialog) => {
    router.push({
      pathname: '/chat',
      params: {
        dialogId: String(dialog.dialog_id || dialog.id),
        dialogName: dialog.dialog_name || dialog.name || 'Chat',
        dialogTypeKey: dialog.dialog_type_key || 'chat',
      },
    });
  }, [router]);

  // Refetch account info (unread counts) when tab gains focus
  useEffect(() => {
    if (isFocused) refetchAccount();
  }, [isFocused, refetchAccount]);

  // Setup Pusher subscriptions
  useEffect(() => {
    if (!isFocused || !userId) return;

    const pusher = getPusher();

    pusher.unsubscribe(CHANNEL_NAMES.TAP_PAGE);
    pusher.unsubscribe(CHANNEL_NAMES.USER);

    channelRef.current = pusher.subscribe(CHANNEL_NAMES.TAP_PAGE);

    userChannelRef.current = pusher.subscribe(CHANNEL_NAMES.USER);
    userChannelRef.current.bind(`${userId}:dialogs:new`, () => {
      loadDialogs(true);
    });

    dialogs.forEach((dialog) => {
      const dialogId = dialog.dialog_id || dialog.id;
      channelRef.current?.bind(`dialogs:${dialogId}:messages:new`, () => {
        loadDialogs(true);
      });
    });

    return () => {
      pusher.unsubscribe(CHANNEL_NAMES.TAP_PAGE);
      pusher.unsubscribe(CHANNEL_NAMES.USER);
      channelRef.current = null;
      userChannelRef.current = null;
    };
  }, [isFocused, userId, dialogs, loadDialogs]);

  // Render
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Dialog>) => (
    <MessageItem
      item={item}
      searchTerm={searchTerm}
      onPress={handleDialogPress}
    />
  ), [searchTerm, handleDialogPress]);

  const keyExtractor = useCallback((item: Dialog, index: number) =>
    `${item.dialog_id || item.id}-${index}`,
  []);

  const getEmptyText = () => {
    if (searchTerm && activeTab === 'chat') return 'No search results.';
    switch (activeTab) {
      case 'chat': return 'This is Chats page. Chats will show up here.';
      case 'content': return 'This is Content groups page. Content groups will show up here.';
      case 'faq': return 'This is FAQs page. FAQs will show up here.';
      default: return 'No items found.';
    }
  };

  const isInitialLoading = isLoading && dialogs.length === 0;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <ThemedText type="title">Messages</ThemedText>
      </View>

      <MessagesTabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'chat' && (
        <MessagesSearch
          value={searchTerm}
          onChangeText={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search messages..."
        />
      )}

      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.secondary} />
        </View>
      ) : dialogs.length === 0 && !isFetching ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={[styles.emptyText, { color: colors.text.secondary }]}>
            {getEmptyText()}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={dialogs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onRefresh={handleRefresh}
          refreshing={isFetching && !isLoading && !isLoadingMore}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.border.default }]} />
          )}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.text.secondary} />
              </View>
            ) : null
          }
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
