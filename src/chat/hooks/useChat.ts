import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store';
import { selectMessagesByDialogId, selectDialogById } from '@/store/features/dialogs/selectors';
import { authSelectors } from '@/store/features/auth';
import { useViewMessagesMutation } from '@/store/features/dialogs';
import type { Message, ParentMessage } from '@/store/types_that_will_used';
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

export const useChat = ({ dialogId, chatType, config = {}, searchTerm }: UseChatOptions) => {
  const currentUser = useAppSelector(authSelectors.selectUser);
  const storeMessages = useAppSelector(selectMessagesByDialogId(dialogId));
  const dialog = useAppSelector(selectDialogById(dialogId));
  const currentUserId = currentUser?.id ?? 0;

  const { isLoadingMore, hasMore, loadMore, refresh } = useChatMessages({
    dialogId,
    isFaq: config.isFaq,
  });

  usePusherChat({ dialogId });

  const { sendMessage: sendRaw, isSending } = useSendMessage({
    dialogId,
    currentUser,
    isFaq: config.isFaq,
  });

  const [viewMessages] = useViewMessagesMutation();

  // Mark messages as viewed once on initial load
  const viewedRef = useRef(false);
  useEffect(() => {
    if (!dialogId || !storeMessages.length || viewedRef.current) return;
    viewedRef.current = true;

    const messageIds = storeMessages
      .filter((m) => !m.is_your && m.id)
      .slice(0, 30)
      .map((m) => m.id);

    if (messageIds.length > 0) {
      viewMessages({ dialog_id: dialogId, message_ids: messageIds }).catch(() => {});
    }
  }, [dialogId, storeMessages.length, viewMessages]);

  // Reply state
  const [replyTo, setReplyTo] = useState<ParentMessage | null>(null);

  // Transform messages for GiftedChat (newest first)
  const messages: ChatMessage[] = useMemo(() => {
    return [...storeMessages]
      .filter((m) => m.type !== 'counter')
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .map((msg) => transformMessage(msg, currentUserId, searchTerm));
  }, [storeMessages, currentUserId, searchTerm]);

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
    messages,
    dialog,
    currentUser,
    currentUserId,
    isLoadingMore,
    hasMore,
    isSending,
    onSend,
    onLoadEarlier,
    refresh,
    replyTo,
    startReply,
    cancelReply,
    dialogClosed,
    dialogArchived,
  };
};
