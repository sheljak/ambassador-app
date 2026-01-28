import React, { useMemo } from 'react';
import { View } from 'react-native';

import type { FeedPost } from '@/store/types_that_will_used';

// Feed type components
import ImageFeed from './ImageFeed';
import VideoFeed from './VideoFeed';
import TextFeed from './TextFeed';
import QuestionFeed from './QuestionFeed';
import AnswerFeed from './AnswerFeed';
import SystemFeed from './SystemFeed';
import ProfileFeed from './ProfileFeed';
import LeadersFeed from './LeadersFeed';

// Types
export interface FeedItemProps {
  data: FeedPost;
  selectedIndex: number;
  currentUser?: string | number;
  onAddAnswer?: (data: FeedPost) => void;
}

type FeedTypeKey =
  | 'started_conversation'
  | 'image'
  | 'video'
  | 'new_faq_question'
  | 'new_faq_answered'
  | 'system'
  | 'ambassador_card'
  | 'top_month'
  | 'notification';

const FeedItem: React.FC<FeedItemProps> = ({
  data,
  selectedIndex,
  currentUser,
  onAddAnswer,
}) => {
  const typeKey = data.type_key as FeedTypeKey;

  // Memoize the rendered component based on type
  const message = useMemo(() => {
    switch (typeKey) {
      case 'started_conversation':
        return <TextFeed data={data} />;

      case 'image':
        return <ImageFeed data={data} />;

      case 'video':
        return <VideoFeed data={data} />;

      case 'new_faq_question':
        return (
          <QuestionFeed
            data={data}
            onAddAnswer={onAddAnswer ? () => onAddAnswer(data) : undefined}
          />
        );

      case 'new_faq_answered':
        return <AnswerFeed data={data} />;

      case 'system':
        return <SystemFeed data={data} />;

      case 'ambassador_card':
        return <ProfileFeed data={data} />;

      case 'top_month': {
        // Only show leaders feed in "All feed" mode (index 0) or if current user is in the leaders
        if (selectedIndex === 0) {
          return (
            <LeadersFeed
              data={data}
              selectedIndex={selectedIndex}
              currentUser={currentUser}
            />
          );
        }
        if (
          selectedIndex === 1 &&
          data.extraData?.ambassadors?.some(
            (item: { id: string | number }) => item.id === currentUser
          )
        ) {
          return (
            <LeadersFeed
              data={data}
              selectedIndex={selectedIndex}
              currentUser={currentUser}
            />
          );
        }
        return null;
      }

      case 'notification':
        // Notifications are handled separately
        return null;

      default:
        return null;
    }
  }, [typeKey, data, selectedIndex, currentUser, onAddAnswer]);

  if (!message) {
    return null;
  }

  return <View>{message}</View>;
};

// Use React.memo for performance optimization
// Only re-render if data, selectedIndex, or currentUser changes
export default React.memo(FeedItem, (prevProps, nextProps) => {
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.selectedIndex === nextProps.selectedIndex &&
    prevProps.currentUser === nextProps.currentUser &&
    prevProps.onAddAnswer === nextProps.onAddAnswer
  );
});
