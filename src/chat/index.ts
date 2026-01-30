// Components
export { ChatView } from './components/ChatView';
export { ChatBubble } from './components/ChatBubble';
export { ChatMenu } from './components/ChatMenu';
export { ReplyFooter, ClosedChatBanner } from './components/ChatInput';

// Hooks
export { useChat } from './hooks/useChat';
export { useChatMessages } from './hooks/useChatMessages';
export { usePusherChat } from './hooks/usePusherChat';
export { useSendMessage } from './hooks/useSendMessage';

// Types
export type { ChatMessage, ChatType, ChatConfig, ChatViewProps } from './types';
export { mapDialogTypeKeyToChatType, getChatConfig } from './types';

// Styles
export { chatStyles, COLORS, SPACING, RADIUS, TYPOGRAPHY } from './components/styles';
