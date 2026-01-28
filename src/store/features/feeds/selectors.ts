import { createSelector } from '@reduxjs/toolkit';
import { SLICE_KEY } from './constants';
import type { FeedsState, FeedType } from './types';

type RootState = {
  [SLICE_KEY]: FeedsState;
};

// Base selector
const selectFeedsSlice = (state: RootState): FeedsState => state[SLICE_KEY];

// Helper to get feed key
const getFeedKey = (type: FeedType) => {
  const feedKeys = {
    all: 'allFeed',
    my: 'myFeed',
  } as const;
  return feedKeys[type];
};

// Memoized selectors
export const selectFeedType = createSelector(
  [selectFeedsSlice],
  (feeds) => feeds.type
);

export const selectAllFeed = createSelector(
  [selectFeedsSlice],
  (feeds) => feeds.allFeed
);

export const selectMyFeed = createSelector(
  [selectFeedsSlice],
  (feeds) => feeds.myFeed
);

export const selectCurrentFeed = createSelector(
  [selectFeedsSlice],
  (feeds) => {
    const feedKey = getFeedKey(feeds.type);
    return feeds[feedKey];
  }
);

export const selectCurrentFeedItems = createSelector(
  [selectCurrentFeed],
  (feed) => feed.items
);

export const selectIsRefreshing = createSelector(
  [selectFeedsSlice],
  (feeds) => feeds.isRefreshing
);

export const selectFeedById = (feedId: number) =>
  createSelector([selectFeedsSlice], (feeds) => {
    // Search across all feeds
    const allFeeds = [
      ...feeds.allFeed.items,
      ...feeds.myFeed.items,
    ];
    return allFeeds.find((item) => item.id === feedId);
  });

export const feedsSelectors = {
  selectFeedsSlice,
  selectFeedType,
  selectAllFeed,
  selectMyFeed,
  selectCurrentFeed,
  selectCurrentFeedItems,
  selectIsRefreshing,
  selectFeedById,
};
