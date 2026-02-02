import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '@/store';
import { useLazyGetMessagesQuery } from '@/store/features/dialogs';
import { setMessages, appendMessages } from '@/store/features/dialogs';
import { MESSAGES_PAGE_SIZE } from '@/store/features/dialogs/constants';
import type { Message } from '@/store/types_that_will_used';

/**
 * Extract messages array and total from API response.
 * The API may return data in different shapes, so we use fallbacks.
 */
const parseMessagesResponse = (response: any): { messages: Message[]; total: number } => {
  const data = response?.data;
  const messages: Message[] =
    data?.messages ?? data?.data ?? (Array.isArray(data) ? data : []);
  const total: number =
    data?.total ?? data?.meta?.total ?? messages.length;
  return { messages, total };
};

interface UseChatMessagesOptions {
  dialogId: number;
  isFaq?: boolean;
  autoLoad?: boolean;
}

export const useChatMessages = ({
  dialogId,
  isFaq = false,
  autoLoad = true,
}: UseChatMessagesOptions) => {
  const dispatch = useAppDispatch();
  const [fetchMessages] = useLazyGetMessagesQuery();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const initialLoadDone = useRef(false);

  // Initial load
  useEffect(() => {
    if (!dialogId || !autoLoad || initialLoadDone.current) return;

    initialLoadDone.current = true;
    offsetRef.current = 0;

    fetchMessages({
      dialog_id: dialogId,
      offset: 0,
      limit: MESSAGES_PAGE_SIZE,
      ...(isFaq && { isFaq: true }),
    })
      .unwrap()
      .then((response) => {
        const { messages, total } = parseMessagesResponse(response);

        dispatch(setMessages({ dialogId, messages }));
        offsetRef.current = messages.length;
        setHasMore(messages.length < total);
      })
      .catch(() => {
        // Error handled by RTK Query
      });
  }, [dialogId, autoLoad, isFaq, fetchMessages, dispatch]);

  // Reset on dialog change
  useEffect(() => {
    return () => {
      initialLoadDone.current = false;
      offsetRef.current = 0;
    };
  }, [dialogId]);

  const loadMore = useCallback(async () => {
    if (!dialogId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchMessages({
        dialog_id: dialogId,
        offset: offsetRef.current,
        limit: MESSAGES_PAGE_SIZE,
        ...(isFaq && { isFaq: true }),
      }).unwrap();

      const { messages, total } = parseMessagesResponse(response);

      if (messages.length > 0) {
        dispatch(appendMessages({ dialogId, messages, prepend: true }));
        offsetRef.current += messages.length;
      }
      setHasMore(offsetRef.current < total);
    } catch {
      // Error handled by RTK Query
    } finally {
      setIsLoadingMore(false);
    }
  }, [dialogId, isLoadingMore, hasMore, isFaq, fetchMessages, dispatch]);

  const refresh = useCallback(async () => {
    if (!dialogId) return;

    offsetRef.current = 0;
    try {
      const response = await fetchMessages({
        dialog_id: dialogId,
        offset: 0,
        limit: MESSAGES_PAGE_SIZE,
        ...(isFaq && { isFaq: true }),
      }).unwrap();

      const { messages, total } = parseMessagesResponse(response);

      dispatch(setMessages({ dialogId, messages }));
      offsetRef.current = messages.length;
      setHasMore(messages.length < total);
    } catch {
      // Error handled by RTK Query
    }
  }, [dialogId, isFaq, fetchMessages, dispatch]);

  return { isLoadingMore, hasMore, loadMore, refresh };
};
