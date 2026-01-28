import { createSelector } from '@reduxjs/toolkit';
import { SLICE_KEY } from './constants';
import type { DialogsState } from './types';

type RootState = {
  [SLICE_KEY]: DialogsState;
};

// Base selector
const selectDialogsSlice = (state: RootState): DialogsState => state[SLICE_KEY];

// Memoized selectors
export const selectDialogs = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.dialogs
);

export const selectActiveDialogId = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.activeDialogId
);

export const selectActiveDialog = createSelector(
  [selectDialogs, selectActiveDialogId],
  (dialogs, activeId) => dialogs.find((d) => d.id === activeId) || null
);

export const selectDialogById = (dialogId: number) =>
  createSelector([selectDialogs], (dialogs) =>
    dialogs.find((d) => d.id === dialogId)
  );

export const selectMessages = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.messages
);

export const selectMessagesByDialogId = (dialogId: number) =>
  createSelector([selectMessages], (messages) => messages[dialogId] || []);

export const selectActiveDialogMessages = createSelector(
  [selectMessages, selectActiveDialogId],
  (messages, activeId) => (activeId ? messages[activeId] || [] : [])
);

export const selectTotalUnread = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.totalUnread
);

export const selectIsLoading = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.isLoading
);

export const selectError = createSelector(
  [selectDialogsSlice],
  (dialogs) => dialogs.error
);

export const selectSortedDialogs = createSelector([selectDialogs], (dialogs) =>
  [...dialogs].sort((a, b) => {
    // Sort by last message date if available
    const aDate = a.last_message?.created_at;
    const bDate = b.last_message?.created_at;
    if (aDate && bDate) {
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
  })
);

export const dialogsSelectors = {
  selectDialogsSlice,
  selectDialogs,
  selectActiveDialogId,
  selectActiveDialog,
  selectDialogById,
  selectMessages,
  selectMessagesByDialogId,
  selectActiveDialogMessages,
  selectTotalUnread,
  selectIsLoading,
  selectError,
  selectSortedDialogs,
};
