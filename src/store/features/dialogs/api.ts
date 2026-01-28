import { baseApi } from '../../services/baseApi';
import type {
  GetDialogs,
  GetDialogInfo,
  GetDialogMessages,
  SendMessage,
  CreateDialog,
  ViewMessages,
  ToggleDialogArchive,
  ReportDialog,
  Dialog,
  Message,
} from '../../types_that_will_used';

export const dialogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dialogs list
    getDialogs: builder.query<GetDialogs.Response, Partial<GetDialogs.Request>>({
      query: ({ offset = 0, limit = 20, types, search } = {}) => {
        const params: Record<string, unknown> = {
          offset,
          limit,
        };
        if (types) params.types = types;
        if (search) params.search = search;

        return {
          url: 'v1/application/dialogs',
          params,
        };
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((dialog: Dialog) => ({
                type: 'Dialogs' as const,
                id: dialog.id,
              })),
              { type: 'Dialogs', id: 'LIST' },
            ]
          : [{ type: 'Dialogs', id: 'LIST' }],
    }),

    // Get dialog info
    getDialog: builder.query<GetDialogInfo.Response, number>({
      query: (dialogId) => `v1/application/dialogs/${dialogId}`,
      providesTags: (result, error, dialogId) => [{ type: 'Dialogs', id: dialogId }],
    }),

    // Get messages
    getMessages: builder.query<GetDialogMessages.Response, GetDialogMessages.Request>({
      query: ({ dialog_id, offset = 0, limit = 30, beforeMessageId, afterMessageId, aroundMessageId }) => {
        const params: Record<string, unknown> = {
          offset,
          limit,
        };
        if (beforeMessageId) params.beforeMessageId = beforeMessageId;
        if (afterMessageId) params.afterMessageId = afterMessageId;
        if (aroundMessageId) params.aroundMessageId = aroundMessageId;

        return {
          url: `v1/application/dialogs/${dialog_id}/messages`,
          params,
        };
      },
      providesTags: (result, error, { dialog_id }) => [
        { type: 'Messages', id: dialog_id },
      ],
    }),

    // Send message
    sendMessage: builder.mutation<SendMessage.Response, SendMessage.Request>({
      query: ({ dialog_id, ...data }) => ({
        url: `v1/application/dialogs/${dialog_id}/messages/send`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { dialog_id }) => [
        { type: 'Messages', id: dialog_id },
        { type: 'Dialogs', id: dialog_id },
        { type: 'Dialogs', id: 'LIST' },
      ],
    }),

    // Create dialog (start chat)
    createDialog: builder.mutation<CreateDialog.Response, CreateDialog.Request>({
      query: (data) => ({
        url: 'v1/application/dialogs/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Dialogs', id: 'LIST' }],
    }),

    // Mark messages as viewed
    viewMessages: builder.mutation<ViewMessages.Response, ViewMessages.Request>({
      query: ({ dialog_id, message_ids }) => ({
        url: `v1/application/dialogs/${dialog_id}/messages/view`,
        method: 'POST',
        body: { message_ids },
      }),
      invalidatesTags: (result, error, { dialog_id }) => [
        { type: 'Dialogs', id: dialog_id },
      ],
    }),

    // Toggle archive dialog
    toggleArchiveDialog: builder.mutation<ToggleDialogArchive.Response, ToggleDialogArchive.Request>({
      query: ({ dialog_id, socketId }) => ({
        url: `v1/application/dialogs/${dialog_id}/archive/toggle`,
        method: 'PUT',
        body: socketId ? { socketId } : undefined,
      }),
      invalidatesTags: (result, error, { dialog_id }) => [
        { type: 'Dialogs', id: dialog_id },
        { type: 'Dialogs', id: 'LIST' },
      ],
    }),

    // Report dialog
    reportDialog: builder.mutation<ReportDialog.Response, ReportDialog.Request>({
      query: ({ dialog_id, reported_reason }) => ({
        url: `v1/application/dialogs/${dialog_id}/report`,
        method: 'PUT',
        body: { reported_reason },
      }),
      invalidatesTags: (result, error, { dialog_id }) => [
        { type: 'Dialogs', id: dialog_id },
      ],
    }),
  }),
});

export const {
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
} = dialogsApi;

// Re-export types
export type { Dialog, Message };
