import type { User, Message, DialogMember } from '../shared/types';

export type DialogType = 'direct' | 'group' | 'support';

export interface Dialog {
    id: string;
    type: DialogType;
    name?: string;
    avatar?: string;
    members: DialogMember[];
    lastMessage?: Message;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NewMessages {
    dialogId: string;
    messages: Message[];
    totalUnread: number;
}
