import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
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
import { Loader } from '@/components/Loader';
import { useTheme, createStyles } from '@/theme';
import { useLazyGetDialogsQuery } from '@/store/features/dialogs/api';
import { useGetAccountQuery } from '@/store/features/auth/api';
import { useAppSelector } from '@/store';
import { selectMessages } from '@/store/features/dialogs/selectors';
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

interface PusherMessageEvent {
  dialog_id: number;
  notification?: {
    message?: string;
    title?: string;
    icon?: string;
  };
  type?: string;
  user_id?: number;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
  const storeMessages = useAppSelector(selectMessages);
  const storeMessagesRef = useRef(storeMessages);
  storeMessagesRef.current = storeMessages;

  const [getDialogs, { isLoading, isFetching }] = useLazyGetDialogsQuery();

  const channelRef = useRef<Channel | null>(null);
  const userChannelRef = useRef<Channel | null>(null);
  const messagesChannelRef = useRef<Channel | null>(null);

  // Ref to track current dialog IDs for Pusher subscriptions (avoids re-subscribe loops)
  const dialogIdsRef = useRef<number[]>([]);

  // Track which dialog IDs have bound Pusher handlers (to avoid duplicate binds)
  const boundDialogIdsRef = useRef<Set<number>>(new Set());

  // Track the last visited dialog so we can clear its unread counter on return
  const lastVisitedDialogRef = useRef<number | null>(null);
  const lastVisitedMessageIdRef = useRef<Record<number, number | null>>({});

  // Cache key for current tab + search
  const cacheKey = useMemo(() => {
    const search = activeTab === 'chat' ? debouncedSearchTerm : '';
    return `${activeTab}:${search}`;
  }, [activeTab, debouncedSearchTerm]);

  // Search pending = user typed but debounce hasn't settled yet
  const isSearchPending = searchTerm !== debouncedSearchTerm;

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

  // Update a single dialog in-place (for Pusher events)
  const updateDialogInPlace = useCallback((event: PusherMessageEvent) => {
    setDialogs((prev) => {
      const dialogId = event.dialog_id;
      const idx = prev.findIndex(
        (d) => (d.dialog_id || d.id) === dialogId
      );
      if (idx === -1) return prev; // dialog not in list, skip

      const updated = { ...prev[idx] };

      // Update last message text from notification
      if (event.notification?.message) {
        updated.last_message = {
          ...(updated.last_message || {}),
          type: 'text',
          content: { text: event.notification.message },
        } as any;
      }

      // Increment new messages counter
      updated.new_messages = (updated.new_messages || 0) + 1;

      // Update last activity to now
      updated.dialog_last_activity = new Date().toISOString();

      // Move to top of list
      const next = [updated, ...prev.filter((_, i) => i !== idx)];

      // Update cache too
      const key = `${activeTab}:${activeTab === 'chat' ? debouncedSearchTerm : ''}`;
      if (tabCacheRef.current[key]) {
        tabCacheRef.current[key] = { ...tabCacheRef.current[key], dialogs: next };
      }

      return next;
    });

    // Also refresh account unread counts
    // refetchAccount();
  }, [activeTab, debouncedSearchTerm]);

  const getLatestMessage = useCallback((messages?: Dialog['last_message'][] | any[]) => {
    if (!messages || messages.length === 0) return null;
    return messages.reduce((latest, msg) => {
      if (!latest) return msg;
      const latestAt = latest.created_at ? new Date(latest.created_at).getTime() : 0;
      const msgAt = msg.created_at ? new Date(msg.created_at).getTime() : 0;
      return msgAt >= latestAt ? msg : latest;
    }, null as any);
  }, []);

  const syncDialogFromStore = useCallback((dialogId: number, options?: { markRead?: boolean; moveToTop?: boolean }) => {
    const dialogMessages = storeMessagesRef.current[dialogId];
    const latestMessage = getLatestMessage(dialogMessages);

    setDialogs((prev) => {
      const idx = prev.findIndex((d) => (d.dialog_id || d.id) === dialogId);
      if (idx === -1) return prev;

      const updates: Partial<Dialog> = {};
      if (options?.markRead) {
        updates.new_messages = 0;
      }
      if (latestMessage) {
        updates.last_message = latestMessage as any;
        updates.dialog_last_activity = latestMessage.created_at || new Date().toISOString();
      }

      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };

      const ordered = options?.moveToTop
        ? [next[idx], ...next.filter((_, i) => i !== idx)]
        : next;

      const key = `${activeTab}:${activeTab === 'chat' ? debouncedSearchTerm : ''}`;
      if (tabCacheRef.current[key]) {
        tabCacheRef.current[key] = { ...tabCacheRef.current[key], dialogs: ordered };
      }

      return ordered;
    });
  }, [activeTab, debouncedSearchTerm, getLatestMessage]);

  const syncDialogsFromStore = useCallback(() => {
    setDialogs((prev) => {
      let changed = false;
      const next = prev.map((dialog) => {
        const dialogId = dialog.dialog_id || dialog.id;
        const dialogMessages = storeMessagesRef.current[dialogId];
        const latestMessage = getLatestMessage(dialogMessages);

        if (!latestMessage) return dialog;

        const latestAt = latestMessage.created_at ? new Date(latestMessage.created_at).getTime() : 0;
        const currentAt = dialog.dialog_last_activity ? new Date(dialog.dialog_last_activity).getTime() : 0;
        const hasNewer = latestAt > currentAt || dialog.last_message?.id !== latestMessage.id;

        if (!hasNewer) return dialog;

        changed = true;
        return {
          ...dialog,
          last_message: latestMessage as any,
          dialog_last_activity: latestMessage.created_at || new Date().toISOString(),
        };
      });

      if (!changed) return prev;

      const key = `${activeTab}:${activeTab === 'chat' ? debouncedSearchTerm : ''}`;
      if (tabCacheRef.current[key]) {
        tabCacheRef.current[key] = { ...tabCacheRef.current[key], dialogs: next };
      }

      return next;
    });
  }, [activeTab, debouncedSearchTerm, getLatestMessage]);

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
    lastVisitedDialogRef.current = dialog.dialog_id || dialog.id;
    lastVisitedMessageIdRef.current[lastVisitedDialogRef.current] =
      (dialog.last_message as any)?.id ?? null;
    router.push({
      pathname: '/chat',
      params: {
        dialogId: String(dialog.dialog_id || dialog.id),
        dialogName: dialog.dialog_name || dialog.name || 'Chat',
        dialogTypeKey: dialog.dialog_type_key || 'chat',
      },
    });
  }, [router]);

  // Refetch account info (unread counts) when tab gains focus — but don't refetch dialog list
  useEffect(() => {
    if (isFocused) {
      // Update the dialog the user just visited: clear unread counter + update last message
      const visitedId = lastVisitedDialogRef.current;
      if (visitedId) {
        lastVisitedDialogRef.current = null;
        const dialogMessages = storeMessagesRef.current[visitedId];
        const latestMessage = getLatestMessage(dialogMessages);
        const prevMessageId = lastVisitedMessageIdRef.current[visitedId] ?? null;
        const hasNewLocalMessage =
          latestMessage && latestMessage.id && latestMessage.id !== prevMessageId;
        const isMine =
          !!latestMessage && (latestMessage.is_your || latestMessage.user?.id === userId);

        syncDialogFromStore(visitedId, {
          markRead: true,
          moveToTop: hasNewLocalMessage && isMine,
        });
      } else {
        syncDialogsFromStore();
      }

      // Restore from cache on focus if list is empty (avoid refetch)
      const key = `${activeTab}:${activeTab === 'chat' ? debouncedSearchTerm : ''}`;
      const cached = tabCacheRef.current[key];
      if (dialogs.length === 0 && cached) {
        setDialogs(cached.dialogs);
        setTotal(cached.total);
      }
    }
  }, [isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep dialogIdsRef in sync
  useEffect(() => {
    dialogIdsRef.current = dialogs.map((d) => d.dialog_id || d.id);
  }, [dialogs]);

  // Setup Pusher subscriptions — use refs to avoid re-subscribe loops
  useEffect(() => {
    if (!isFocused || !userId) return;

    const pusher = getPusher();

    pusher.unsubscribe(CHANNEL_NAMES.TAP_PAGE);
    pusher.unsubscribe(CHANNEL_NAMES.USER);

    channelRef.current = pusher.subscribe(CHANNEL_NAMES.TAP_PAGE);

    // New dialog created → full refetch (rare event)
    userChannelRef.current = pusher.subscribe(CHANNEL_NAMES.USER);
    userChannelRef.current.bind(`${userId}:dialogs:new`, () => {
      loadDialogs(true);
    });

    // Real-time badge counter updates (same as legacy "messages" channel)
    pusher.unsubscribe(CHANNEL_NAMES.MESSAGES);
    messagesChannelRef.current = pusher.subscribe(CHANNEL_NAMES.MESSAGES);
    messagesChannelRef.current.bind(`counter:new:${userId}`, () => {
      // refetchAccount();
    });

    // Per-dialog message events → update in-place
    boundDialogIdsRef.current = new Set();
    const ids = dialogIdsRef.current;
    ids.forEach((dialogId) => {
      channelRef.current?.bind(
        `dialogs:${dialogId}:messages:new`,
        (data: PusherMessageEvent) => {
          updateDialogInPlace({ ...data, dialog_id: dialogId });
        }
      );
      boundDialogIdsRef.current.add(dialogId);
    });

    return () => {
      pusher.unsubscribe(CHANNEL_NAMES.TAP_PAGE);
      pusher.unsubscribe(CHANNEL_NAMES.USER);
      pusher.unsubscribe(CHANNEL_NAMES.MESSAGES);
      channelRef.current = null;
      userChannelRef.current = null;
      messagesChannelRef.current = null;
      boundDialogIdsRef.current = new Set();
    };
  }, [isFocused, userId, loadDialogs, updateDialogInPlace, refetchAccount]);

  // Bind events for newly added dialogs (without re-binding existing ones)
  useEffect(() => {
    if (!channelRef.current) return;

    const ids = dialogIdsRef.current;
    ids.forEach((dialogId) => {
      if (boundDialogIdsRef.current.has(dialogId)) return;
      channelRef.current?.bind(
        `dialogs:${dialogId}:messages:new`,
        (data: PusherMessageEvent) => {
          updateDialogInPlace({ ...data, dialog_id: dialogId });
        }
      );
      boundDialogIdsRef.current.add(dialogId);
    });
  }, [dialogs.length, updateDialogInPlace]);

  // Render
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Dialog>) => (
    <MessageItem
      item={item}
      searchTerm={searchTerm}
      onPress={handleDialogPress}
    />
  ), [searchTerm, handleDialogPress]);

  const keyExtractor = useCallback((item: Dialog, index: number) =>
    String(item.dialog_id || item.id),
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
  // Only show empty state when not loading, not fetching, and search is settled
  const showEmpty = dialogs.length === 0 && !isFetching && !isSearchPending && !isLoading;

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
          <Loader size="large" />
        </View>
      ) : showEmpty ? (
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
                <Loader size="small" inline />
              </View>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
    paddingHorizontal: spacing['2xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    marginLeft: spacing.xs * 19,
  },
  footer: {
    padding: spacing.md,
    alignItems: 'center',
  },
}));
