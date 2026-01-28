import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Dialog, NewMessages } from '../features/dialogs/types';
import type { Message, PaginationMeta } from '../features/shared/types';
import { dialogsApi } from '../api/endpoints';

interface DialogsState {
    dialogs: Dialog[];
    currentDialog: Dialog | null;
    messages: Record<string, Message[]>;
    meta: PaginationMeta | null;
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
}

const initialState: DialogsState = {
    dialogs: [],
    currentDialog: null,
    messages: {},
    meta: null,
    isLoading: false,
    isSending: false,
    error: null,
};

export const fetchDialogs = createAsyncThunk(
    'dialogs/fetchDialogs',
    async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        const response = await dialogsApi.getDialogs(params);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return response.data;
    }
);

export const fetchMessages = createAsyncThunk(
    'dialogs/fetchMessages',
    async ({ dialogId, page }: { dialogId: string; page?: number }, { rejectWithValue }) => {
        const response = await dialogsApi.getMessages(dialogId, page);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return { dialogId, messages: response.data.messages };
    }
);

export const sendMessage = createAsyncThunk(
    'dialogs/sendMessage',
    async ({ dialogId, content }: { dialogId: string; content: string }, { rejectWithValue }) => {
        const response = await dialogsApi.sendMessage(dialogId, content);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return { dialogId, message: response.data.message };
    }
);

const dialogsSlice = createSlice({
    name: 'dialogs',
    initialState,
    reducers: {
        setCurrentDialog: (state, action: PayloadAction<Dialog | null>) => {
            state.currentDialog = action.payload;
        },
        addNewMessages: (state, action: PayloadAction<NewMessages>) => {
            const { dialogId, messages } = action.payload;
            if (!state.messages[dialogId]) {
                state.messages[dialogId] = [];
            }
            state.messages[dialogId].push(...messages);
        },
        clearDialogMessages: (state, action: PayloadAction<string>) => {
            delete state.messages[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDialogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDialogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dialogs = action.payload.dialogs;
                state.meta = action.payload.meta;
            })
            .addCase(fetchDialogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                const { dialogId, messages } = action.payload;
                state.messages[dialogId] = messages;
            })
            .addCase(sendMessage.pending, (state) => {
                state.isSending = true;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isSending = false;
                const { dialogId, message } = action.payload;
                if (!state.messages[dialogId]) {
                    state.messages[dialogId] = [];
                }
                state.messages[dialogId].push(message);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSending = false;
                state.error = action.payload as string;
            });
    },
});

export const { setCurrentDialog, addNewMessages, clearDialogMessages } = dialogsSlice.actions;
export default dialogsSlice.reducer;
