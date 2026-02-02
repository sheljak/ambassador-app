import type { IMessage } from 'react-native-gifted-chat';
import type { Message, User, ParentMessage, DialogTypeKey } from '@/store/types_that_will_used';

/**
 * Chat type mapped from DialogTypeKey for per-screen config.
 */
export type ChatType = 'text' | 'group' | 'discover' | 'content' | 'livestream';

/**
 * Maps DialogTypeKey to ChatType.
 */
export const mapDialogTypeKeyToChatType = (key?: string): ChatType => {
  switch (key) {
    case 'group-chat':
    case 'community-chat':
    case 'community-1-to-1-chat':
    case 'community-prospect-to-prospect-chat':
      return 'group';
    case 'faq':
      return 'discover';
    case 'content-group':
      return 'content';
    case 'live-stream-chat':
    case 'live-event-speakers-chat':
      return 'livestream';
    case 'chat':
    default:
      return 'text';
  }
};

/**
 * Per-screen feature flags.
 */
export interface ChatConfig {
  showReplyFeature?: boolean;
  showReportFeature?: boolean;
  showMenuFeature?: boolean;
  showPinnedMessages?: boolean;
  showScrollDownButton?: boolean;
  showSearchNavigator?: boolean;
  showMembers?: boolean;
  isFaq?: boolean;
  menuItems?: Array<{ label: string; onPress: () => void; hidden?: boolean }>;
}

/**
 * Returns default config for a given chat type.
 */
export const getChatConfig = (chatType: ChatType): ChatConfig => {
  switch (chatType) {
    case 'text':
      return { showReplyFeature: true, showMenuFeature: true };
    case 'group':
      return {
        showReplyFeature: true,
        showReportFeature: true,
        showMenuFeature: true,
        showPinnedMessages: true,
        showScrollDownButton: true,
        showMembers: true,
      };
    case 'discover':
      return { showReplyFeature: false, showMenuFeature: false, isFaq: true };
    case 'content':
      return { showReplyFeature: false, showMenuFeature: false };
    case 'livestream':
      return {
        showReplyFeature: true,
        showReportFeature: true,
        showMenuFeature: true,
        showPinnedMessages: true,
        showScrollDownButton: true,
      };
    default:
      return {};
  }
};

/**
 * GiftedChat-compatible message extending IMessage with chat-specific fields.
 */
export interface ChatMessage extends IMessage {
  parentMessage?: ParentMessage | null;
  isHidden?: boolean;
  isUserBlocked?: boolean;
  isSearchedMessage?: boolean;
  isPinnedMessage?: boolean;
  searchTerm?: string;
  messageType?: string;
  postId?: number | null;
  roleKey?: string;
  /** Original API message for reference */
  _raw?: Message;
}

/**
 * Props for the main ChatView component.
 */
export interface ChatViewProps {
  dialogId: number;
  dialogName?: string;
  chatType: ChatType;
  config?: ChatConfig;
  searchTerm?: string;
  onBack?: () => void;
  onAvatarPress?: (user: User) => void;
}
