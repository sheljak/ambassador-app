import type { DialogsState } from './types';

export const SLICE_KEY = 'dialogs';

export const DIALOGS_DEFAULTS: DialogsState = {
  dialogs: [],
  activeDialogId: null,
  messages: {},
  totalUnread: 0,
  isLoading: false,
  error: null,
};

export const DIALOGS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 30;
