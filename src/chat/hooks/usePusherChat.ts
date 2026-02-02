import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store';
import { addMessage } from '@/store/features/dialogs';
import { getPusher, CHANNEL_NAMES } from '@/services/pusher';
import type { Message } from '@/store/types_that_will_used';

interface UsePusherChatOptions {
  dialogId: number;
  enabled?: boolean;
}

/**
 * Subscribes to Pusher channel for real-time chat messages.
 * Uses tap-page channel with event `dialogs:{dialogId}:messages:new`.
 * Dispatches addMessage to store (slice handles deduplication).
 */
export const usePusherChat = ({ dialogId, enabled = true }: UsePusherChatOptions) => {
  const dispatch = useAppDispatch();
  const channelRef = useRef<ReturnType<ReturnType<typeof getPusher>['subscribe']> | null>(null);

  useEffect(() => {
    if (!dialogId || !enabled) return;

    const pusher = getPusher();
    const channel = pusher.subscribe(CHANNEL_NAMES.TAP_PAGE);
    channelRef.current = channel;

    const eventName = `dialogs:${dialogId}:messages:new`;

    const handler = (data: Message & { dialog_id?: number }) => {
      const messageDialogId = data.dialog_id ?? dialogId;
      if (messageDialogId === dialogId) {
        dispatch(addMessage({ dialogId, message: data }));
      }
    };

    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
      pusher.unsubscribe(CHANNEL_NAMES.TAP_PAGE);
      channelRef.current = null;
    };
  }, [dialogId, enabled, dispatch]);
};
