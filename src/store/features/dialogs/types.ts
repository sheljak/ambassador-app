import type {
  Dialog,
  Message,
  User,
  PaginatedResponse,
} from '../../types_that_will_used';

// Re-export API types from main types file
export type {
  GetDialogs,
  GetDialogInfo,
  GetDialogMessages,
  SendMessage,
  CreateDialog,
  ViewMessages,
  ReportDialog,
  ReportMessage,
  ToggleDialogArchive,
  ExitDialog,
  Dialog,
  Message,
} from '../../types_that_will_used';

// ============================================================================
// State Types
// ============================================================================

export type DialogType = 'direct' | 'group' | 'support';

export interface DialogsState {
  dialogs: Dialog[];
  activeDialogId: number | null;
  messages: Record<number, Message[]>;
  totalUnread: number;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Request/Response Types (for internal use)
// ============================================================================

export interface GetDialogsRequest {
  offset?: number;
  limit?: number;
  types?: string;
  search?: string;
}

export interface GetDialogsResponse {
  success: boolean;
  data: PaginatedResponse<Dialog>;
}

export interface GetMessagesRequest {
  dialogId: number;
  offset?: number;
  limit?: number;
  beforeMessageId?: number;
  afterMessageId?: number;
  aroundMessageId?: number;
}

export interface GetMessagesResponse {
  success: boolean;
  data: PaginatedResponse<Message>;
}

export interface SendMessageRequest {
  dialog_id: number;
  content?: string;
  text?: string;
  type?: string;
  file?: unknown;
  image?: unknown;
  video?: unknown;
  audio?: unknown;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message;
}

export interface CreateDialogRequest {
  user_id?: number;
}

export interface CreateDialogResponse {
  success: boolean;
  data: Dialog;
}

export interface MarkAsReadRequest {
  dialog_id: number;
  message_ids?: number[];
}

export interface MarkAsReadResponse {
  success: boolean;
}

// ============================================================================
// Payload Types
// ============================================================================

export interface SetDialogsPayload {
  dialogs: Dialog[];
}

export interface AddMessagePayload {
  dialogId: number;
  message: Message;
}

export interface SetMessagesPayload {
  dialogId: number;
  messages: Message[];
}

export interface UpdateDialogPayload {
  dialogId: number;
  updates: Partial<Dialog>;
}
