import type { FeedsState, FeedData } from './types';

export const SLICE_KEY = 'feeds';

export const DEFAULT_FEED_DATA: FeedData = {
  items: [],
  total: 0,
  offset: 0,
  lastFetchedAt: null,
};

export const FEEDS_DEFAULTS: FeedsState = {
  type: 'all',
  allFeed: { ...DEFAULT_FEED_DATA },
  myFeed: { ...DEFAULT_FEED_DATA },
  isRefreshing: false,
};

export const FEED_PAGE_SIZE = 10;
