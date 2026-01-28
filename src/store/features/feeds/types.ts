import type {
  FeedPost,
  PaginatedResponse,
  ApiResponse,
} from '../../types_that_will_used';

// Re-export API types from main types file
export type {
  GetFeed,
  CreateFeedPost,
  UpdateFeedPost,
  FeedPost,
} from '../../types_that_will_used';

// ============================================================================
// State Types
// ============================================================================

export type FeedType = 'all' | 'my';

export interface FeedData {
  items: FeedPost[];
  total: number;
  offset: number;
  lastFetchedAt: number | null;
}

export interface FeedsState {
  type: FeedType;
  allFeed: FeedData;
  myFeed: FeedData;
  isRefreshing: boolean;
}

// ============================================================================
// Request/Response Types (for internal use)
// ============================================================================

export interface GetFeedsRequest {
  type?: FeedType;
  offset?: number;
  limit?: number;
}

export interface GetFeedsResponse {
  success: boolean;
  data: PaginatedResponse<FeedPost>;
}

export interface CreatePostRequest {
  caption?: string;
  file?: unknown;
  image?: unknown;
  video?: unknown;
  type?: string;
}

export interface CreatePostResponse {
  success: boolean;
  data: FeedPost;
}

// ============================================================================
// Payload Types
// ============================================================================

export interface SetFeedItemsPayload {
  type: FeedType;
  items: FeedPost[];
  total: number;
}

export interface AppendFeedItemsPayload {
  type: FeedType;
  items: FeedPost[];
  offset: number;
  total: number;
}

export interface UpdateFeedItemPayload {
  feedId: number;
  updates: Partial<FeedPost>;
}
