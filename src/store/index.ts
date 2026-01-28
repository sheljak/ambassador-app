import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// RTK Query APIs
import { baseApi, baseApiV2 } from './services/baseApi';

// Feature reducers
import { authReducer } from './features/auth';
import { feedsReducer } from './features/feeds';
import { dialogsReducer } from './features/dialogs';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [baseApi.reducerPath]: baseApi.reducer,
    [baseApiV2.reducerPath]: baseApiV2.reducer,

    // Feature slices
    auth: authReducer,
    feeds: feedsReducer,
    dialogs: dialogsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(baseApi.middleware)
      .concat(baseApiV2.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-exports
export * from './settings';
export * from './services/baseApi';

// Feature exports - explicitly export to avoid conflicts
export {
  authReducer,
  useLoginMutation,
  useLogoutMutation,
  useGetAccountQuery,
  useLazyGetAccountQuery,
  useUpdateAccountMutation,
  authSelectors,
  hydrateAuth,
  setCredentials,
  setUser,
  setToken,
  setLoading,
  setAuthLoading,
  setError,
  setAuthError,
  logout,
  resetAuth,
  clearError as clearAuthError,
  SLICE_KEY as AUTH_SLICE_KEY,
} from './features/auth';

export {
  feedsReducer,
  useGetFeedsQuery,
  useLazyGetFeedsQuery,
  useGetFeedItemQuery,
  useLazyGetFeedItemQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  feedsSelectors,
  setFeedType,
  setFeedItems,
  appendFeedItems,
  resetFeeds,
  SLICE_KEY as FEEDS_SLICE_KEY,
} from './features/feeds';

export {
  dialogsReducer,
  useGetDialogsQuery,
  useLazyGetDialogsQuery,
  useGetDialogQuery,
  useLazyGetDialogQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useCreateDialogMutation,
  useViewMessagesMutation,
  useToggleArchiveDialogMutation,
  useReportDialogMutation,
  dialogsSelectors,
  setDialogs,
  setActiveDialog,
  setMessages,
  addMessage,
  resetDialogs,
  SLICE_KEY as DIALOGS_SLICE_KEY,
} from './features/dialogs';

// Export types from main types file
export type {
  User,
  University,
  Image,
  Dialog,
  Message,
  FeedPost,
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from './types_that_will_used';
