export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface BaseUser {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface User extends BaseUser {
    firstName: string;
    lastName: string;
    avatar?: Image;
    university?: University;
    permissions?: UserPermissions;
}

export interface University {
    id: string;
    name: string;
    logo?: Image;
    country?: Country;
}

export interface Image {
    id: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    alt?: string;
}

export interface Country {
    id: string;
    name: string;
    code: string;
    flag?: string;
}

export interface Tag {
    id: string;
    name: string;
    color?: string;
}

export interface UserPermissions {
    canPost: boolean;
    canComment: boolean;
    canMessage: boolean;
    isAdmin: boolean;
    permissions: Permission[];
}

export interface Permission {
    id: string;
    name: string;
    description?: string;
}

export interface MediaAttachment {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    size: number;
    name?: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

export interface DialogMember {
    id: string;
    user: User;
    role: 'admin' | 'member';
    joinedAt: string;
    lastReadAt?: string;
}

export interface ProspectInfo {
    id: string;
    status: 'pending' | 'active' | 'inactive';
    source?: string;
    notes?: string;
}

export interface Message {
    id: string;
    dialogId: string;
    senderId: string;
    type: MessageType;
    content: string;
    attachments?: MediaAttachment[];
    createdAt: string;
    updatedAt?: string;
    readBy?: string[];
}
