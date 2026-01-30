import { useMemo, useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import { selectMessagesByDialogId, selectDialogById } from '@/store/features/dialogs/selectors';
import { authSelectors } from '@/store/features/auth';
import type { Message, User, ParentMessage } from '@/store/types_that_will_used';
import type { ChatMessage, ChatType, ChatConfig } from '../types';
import { useChatMessages } from './useChatMessages';
import { usePusherChat } from './usePusherChat';
import { useSendMessage } from './useSendMessage';

interface UseChatOptions {
  dialogId: number;
  chatType: ChatType;
  config?: ChatConfig;
  searchTerm?: string;
}

/**
 * Transforms a store Message into a GiftedChat-compatible ChatMessage.
 */
const transformMessage = (
  msg: Message,
  currentUserId: number,
  searchTerm?: string,
): ChatMessage => {
  const isHidden = msg.is_hidden || msg.isUserBlocked;
  const text = isHidden
    ? 'Message is hidden'
    : msg.content?.text ?? msg.text ?? '';

  const chatMsg: ChatMessage = {
    _id: msg.id,
    createdAt: msg.created_at ? new Date(msg.created_at) : new Date(),
    text,
    user: {
      _id: msg.user?.id ?? 0,
      name: msg.user?.name ?? 'Deleted',
      avatar: msg.user?.avatar?.sizes?.['240x240'] ?? msg.user?.avatar?.original ?? '',
    },
    system: msg.system,
    parentMessage: msg.parentMessage ?? null,
    isHidden: msg.is_hidden,
    isUserBlocked: msg.isUserBlocked,
    messageType: msg.type,
    searchTerm,
    roleKey: msg.user?.roles?.[0],
    _raw: msg,
  };
  return chatMsg;
};

/**
 * Main chat orchestrator hook.
 * Combines message loading, pagination, sending, and Pusher realtime.
 */
export const useChat = ({ dialogId, chatType, config = {}, searchTerm }: UseChatOptions) => {
  const currentUser = useAppSelector(authSelectors.selectUser);
  const storeMessages = useAppSelector(selectMessagesByDialogId(dialogId));
  const dialog = useAppSelector(selectDialogById(dialogId));
  const currentUserId = currentUser?.id ?? 0;

  // Sub-hooks
  const { isLoadingMore, hasMore, loadMore, refresh } = useChatMessages({
    dialogId,
    isFaq: config.isFaq,
  });

  usePusherChat({ dialogId });

  const { sendMessage: sendRaw, isSending } = useSendMessage({
    dialogId,
    currentUser,
  });

  // Reply state
  const [replyTo, setReplyTo] = useState<ParentMessage | null>(null);

  // Transform messages for GiftedChat (newest first)
  const messages: ChatMessage[] = useMemo(() => {
    return [...storeMessages]
      .filter((m) => m.type !== 'counter')
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // newest first for GiftedChat
      })
      .map((msg) => transformMessage(msg, currentUserId, searchTerm));
  }, [storeMessages, currentUserId, searchTerm]);

  // Handlers
  const onSend = useCallback(
    (newMessages: ChatMessage[] = []) => {
      const text = newMessages[0]?.text;
      if (text) {
        sendRaw(text, replyTo);
        setReplyTo(null);
      }
    },
    [sendRaw, replyTo],
  );

  const onLoadEarlier = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const startReply = useCallback((message: ChatMessage) => {
    if (message._raw?.parentMessage) {
      // Already a reply, reply to original
      setReplyTo(message._raw.parentMessage);
    } else if (message._raw) {
      setReplyTo({
        id: message._raw.id,
        content: message._raw.content,
        user: message._raw.user,
      });
    }
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  // Dialog state checks
  const dialogClosed = useMemo(() => {
    if (messages.length > 0) {
      return messages[0].messageType === 'closed';
    }
    return false;
  }, [messages]);

  const dialogArchived = useMemo(() => {
    if (messages.length > 0) {
      return messages[0].messageType === 'archived';
    }
    return false;
  }, [messages]);

  return {
    // Data
    messages,
    dialog,
    currentUser,
    currentUserId,

    // Loading state
    isLoadingMore,
    hasMore,
    isSending,

    // Actions
    onSend,
    onLoadEarlier,
    refresh,

    // Reply
    replyTo,
    startReply,
    cancelReply,

    // Dialog state
    dialogClosed,
    dialogArchived,
  };
};
