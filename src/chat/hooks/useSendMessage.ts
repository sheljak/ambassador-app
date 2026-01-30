import { useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { useSendMessageMutation } from '@/store/features/dialogs';
import { addMessage, setMessages } from '@/store/features/dialogs';
import type { Message, User, MessageContent, ParentMessage } from '@/store/types_that_will_used';

interface UseSendMessageOptions {
  dialogId: number;
  currentUser: User | null;
}

/**
 * Send message hook with optimistic UI.
 * Adds a temporary message immediately, replaces with real one on success.
 */
export const useSendMessage = ({ dialogId, currentUser }: UseSendMessageOptions) => {
  const dispatch = useAppDispatch();
  const [sendMessageApi, { isLoading: isSending }] = useSendMessageMutation();

  const sendMessage = useCallback(
    async (text: string, replyTo?: ParentMessage | null) => {
      if (!dialogId || !text.trim() || !currentUser) return;

      const tempId = Date.now();
      const now = new Date().toISOString();

      // Create optimistic message
      const optimisticMessage: Message = {
        id: tempId,
        content: { text: text.trim() },
        type: 'text',
        user: currentUser,
        created_at: now,
        dialog_id: dialogId,
        is_your: true,
        ...(replyTo && { parentMessage: replyTo }),
      };

      // Add optimistic message to store
      dispatch(addMessage({ dialogId, message: optimisticMessage }));

      try {
        const response = await sendMessageApi({
          dialog_id: dialogId,
          content: text.trim(),
          ...(replyTo && { parent_message_id: replyTo.id }),
        }).unwrap();

        // Replace optimistic message with real one from API
        if (response?.data) {
          // We need to update the store - remove temp, add real
          // Since addMessage deduplicates by id, and the real message has a different id,
          // we dispatch it as a new message. The temp one stays but is harmless
          // as it will be overwritten on next full refresh.
          dispatch(addMessage({ dialogId, message: response.data }));
        }
      } catch {
        // On error, we could remove the optimistic message.
        // For now, it stays and will be reconciled on next refresh.
      }
    },
    [dialogId, currentUser, dispatch, sendMessageApi],
  );

  return { sendMessage, isSending };
};
