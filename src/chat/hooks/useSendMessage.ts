import { useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { useSendMessageMutation } from '@/store/features/dialogs';
import { addMessage } from '@/store/features/dialogs';
import type { Message, User, ParentMessage } from '@/store/types_that_will_used';

interface UseSendMessageOptions {
  dialogId: number;
  currentUser: User | null;
  isFaq?: boolean;
}

export const useSendMessage = ({ dialogId, currentUser, isFaq }: UseSendMessageOptions) => {
  const dispatch = useAppDispatch();
  const [sendMessageApi, { isLoading: isSending }] = useSendMessageMutation();

  const sendMessage = useCallback(
    async (text: string, replyTo?: ParentMessage | null) => {
      if (!dialogId || !text.trim() || !currentUser) return;

      const tempId = Date.now();
      const now = new Date().toISOString();

      // Optimistic message
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

      dispatch(addMessage({ dialogId, message: optimisticMessage }));

      try {
        const response = await sendMessageApi({
          dialog_id: dialogId,
          type: 'text',
          text: text.trim(),
          ...(isFaq && { isFaq: true }),
          ...(replyTo && { parentMessageId: replyTo.id }),
        }).unwrap();

        if (response?.data) {
          dispatch(addMessage({ dialogId, message: response.data as Message }));
        }
      } catch {
        // Error handled by RTK Query
      }
    },
    [dialogId, currentUser, isFaq, dispatch, sendMessageApi],
  );

  return { sendMessage, isSending };
};
