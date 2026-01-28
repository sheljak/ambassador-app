/**
 * Shared types - Re-exports common types from the main API types file
 */

export type {
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  User,
  University,
  Image,
  Country,
  UserPermissions,
  Permission,
  UserTags,
  UserTagItem,
  UserAdditionalData,
  UniversityPermission,
  Dialog,
  Message,
} from '../../types_that_will_used';

// Import User for use in local types
import type { User } from '../../types_that_will_used';

// Additional local types that may be needed
export interface Tag {
  id: number;
  name: string;
  key?: string;
  color?: string;
}

export interface MediaAttachment {
  id: number;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  name?: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

export interface DialogMember {
  id: number;
  user: User;
  role: 'admin' | 'member';
  joinedAt?: string;
  lastReadAt?: string;
}

export interface ProspectInfo {
  id: number;
  status: 'pending' | 'active' | 'inactive';
  source?: string;
  notes?: string;
}
