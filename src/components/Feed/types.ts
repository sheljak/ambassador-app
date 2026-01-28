/**
 * Shared types for Feed components
 */

import type { FeedPost } from '@/store/types_that_will_used';

/**
 * Base props for all feed type components
 */
export interface BaseFeedProps {
  data: FeedPost;
  onPress?: () => void;
}

/**
 * Position type for messages (own vs others)
 */
export type MessagePosition = 'my' | 'other';

/**
 * Feed type keys
 */
export type FeedTypeKey =
  | 'started_conversation'
  | 'image'
  | 'video'
  | 'new_faq_question'
  | 'new_faq_answered'
  | 'system'
  | 'ambassador_card'
  | 'top_month'
  | 'notification';
