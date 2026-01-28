import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_KEY, DIALOGS_DEFAULTS } from './constants';
import type { DialogsState } from './types';
import type { Dialog, Message } from '../../types_that_will_used';

const initialState: DialogsState = DIALOGS_DEFAULTS;

const dialogsSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    // Set dialogs list
    setDialogs(state, action: PayloadAction<Dialog[]>) {
      state.dialogs = action.payload;
      state.totalUnread = 0; // Reset, can be calculated if API provides unread count
    },

    // Append dialogs (pagination)
    appendDialogs(state, action: PayloadAction<Dialog[]>) {
      const existingIds = new Set(state.dialogs.map((d) => d.id));
      const newDialogs = action.payload.filter((d) => !existingIds.has(d.id));
      state.dialogs = [...state.dialogs, ...newDialogs];
    },

    // Update a single dialog
    updateDialog(
      state,
      action: PayloadAction<{ dialogId: number; updates: Partial<Dialog> }>
    ) {
      const { dialogId, updates } = action.payload;
      const index = state.dialogs.findIndex((d) => d.id === dialogId);
      if (index !== -1) {
        state.dialogs[index] = { ...state.dialogs[index], ...updates };
      }
    },

    // Set active dialog
    setActiveDialog(state, action: PayloadAction<number | null>) {
      state.activeDialogId = action.payload;
    },

    // Set messages for a dialog
    setMessages(
      state,
      action: PayloadAction<{ dialogId: number; messages: Message[] }>
    ) {
      const { dialogId, messages } = action.payload;
      state.messages[dialogId] = messages;
    },

    // Append messages (pagination)
    appendMessages(
      state,
      action: PayloadAction<{ dialogId: number; messages: Message[]; prepend?: boolean }>
    ) {
      const { dialogId, messages, prepend = false } = action.payload;
      const existing = state.messages[dialogId] || [];
      const existingIds = new Set(existing.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));

      state.messages[dialogId] = prepend
        ? [...newMessages, ...existing]
        : [...existing, ...newMessages];
    },

    // Add a new message (real-time)
    addMessage(
      state,
      action: PayloadAction<{ dialogId: number; message: Message }>
    ) {
      const { dialogId, message } = action.payload;
      const existing = state.messages[dialogId] || [];

      // Don't add if already exists
      if (existing.some((m) => m.id === message.id)) {
        return;
      }

      state.messages[dialogId] = [...existing, message];

      // Update dialog's last message
      const dialogIndex = state.dialogs.findIndex((d) => d.id === dialogId);
      if (dialogIndex !== -1) {
        state.dialogs[dialogIndex].last_message = message;
      }
    },

    // Mark dialog as read
    markDialogAsRead(state, action: PayloadAction<number>) {
      const dialogId = action.payload;
      const index = state.dialogs.findIndex((d) => d.id === dialogId);
      if (index !== -1) {
        // Note: Dialog type from API may not have unreadCount, handle gracefully
        state.totalUnread = Math.max(0, state.totalUnread - 1);
      }
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Set error
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Clear messages for a dialog
    clearMessages(state, action: PayloadAction<number>) {
      delete state.messages[action.payload];
    },

    // Reset dialogs state
    resetDialogs() {
      return initialState;
    },
  },
});

export const {
  setDialogs,
  appendDialogs,
  updateDialog,
  setActiveDialog,
  setMessages,
  appendMessages,
  addMessage,
  markDialogAsRead,
  setLoading,
  setError,
  clearMessages,
  resetDialogs,
} = dialogsSlice.actions;

export const dialogsReducer = dialogsSlice.reducer;

// Re-export everything
export * from './api';
export * from './selectors';
export * from './constants';
export type { DialogsState, DialogType } from './types';
