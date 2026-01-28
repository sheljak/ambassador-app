import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_KEY, FEEDS_DEFAULTS, DEFAULT_FEED_DATA } from './constants';
import type { FeedsState, FeedType } from './types';
import type { FeedPost } from '../../types_that_will_used';

const initialState: FeedsState = FEEDS_DEFAULTS;

// Helper to get feed data key by type
const getFeedKey = (type: FeedType): keyof Pick<FeedsState, 'allFeed' | 'myFeed'> => {
  const feedKeys = {
    all: 'allFeed',
    my: 'myFeed',
  } as const;
  return feedKeys[type];
};

const feedsSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    // Change feed type filter
    setFeedType(state, action: PayloadAction<FeedType>) {
      state.type = action.payload;
    },

    // Set refreshing state
    setRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload;
    },

    // Set feed items (replace all)
    setFeedItems(
      state,
      action: PayloadAction<{
        type: FeedType;
        items: FeedPost[];
        total: number;
      }>
    ) {
      const { type, items, total } = action.payload;
      const feedKey = getFeedKey(type);
      state[feedKey].items = items;
      state[feedKey].total = total;
      state[feedKey].offset = 0;
      state[feedKey].lastFetchedAt = Date.now();
    },

    // Append feed items (for pagination)
    appendFeedItems(
      state,
      action: PayloadAction<{
        type: FeedType;
        items: FeedPost[];
        offset: number;
        total: number;
      }>
    ) {
      const { type, items, offset, total } = action.payload;
      const feedKey = getFeedKey(type);

      // Deduplicate items
      const existingIds = new Set(state[feedKey].items.map((item) => item.id));
      const uniqueNewItems = items.filter((item) => !existingIds.has(item.id));

      state[feedKey].items = [...state[feedKey].items, ...uniqueNewItems];
      state[feedKey].offset = offset;
      state[feedKey].total = total;
      state[feedKey].lastFetchedAt = Date.now();
    },

    // Prepend new items (for real-time updates)
    prependFeedItems(
      state,
      action: PayloadAction<{
        type: FeedType;
        items: FeedPost[];
      }>
    ) {
      const { type, items } = action.payload;
      const feedKey = getFeedKey(type);

      // Deduplicate items
      const existingIds = new Set(state[feedKey].items.map((item) => item.id));
      const uniqueNewItems = items.filter((item) => !existingIds.has(item.id));

      state[feedKey].items = [...uniqueNewItems, ...state[feedKey].items];
      state[feedKey].total += uniqueNewItems.length;
    },

    // Update a single feed item
    updateFeedItem(
      state,
      action: PayloadAction<{
        feedId: number;
        updates: Partial<FeedPost>;
      }>
    ) {
      const { feedId, updates } = action.payload;

      // Update across all feeds
      const feedKeys = ['allFeed', 'myFeed'] as const;
      for (const key of feedKeys) {
        const index = state[key].items.findIndex((item) => item.id === feedId);
        if (index !== -1) {
          state[key].items[index] = { ...state[key].items[index], ...updates };
        }
      }
    },

    // Clear feed data for a type
    clearFeedData(state, action: PayloadAction<FeedType>) {
      const feedKey = getFeedKey(action.payload);
      state[feedKey] = { ...DEFAULT_FEED_DATA };
    },

    // Reset feeds state
    resetFeeds() {
      return initialState;
    },
  },
});

export const {
  setFeedType,
  setRefreshing,
  setFeedItems,
  appendFeedItems,
  prependFeedItems,
  updateFeedItem,
  clearFeedData,
  resetFeeds,
} = feedsSlice.actions;

export const feedsReducer = feedsSlice.reducer;

// Re-export everything
export * from './api';
export * from './selectors';
export * from './constants';
export type { FeedsState, FeedType } from './types';
