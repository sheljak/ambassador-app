/**
 * API Endpoint Types
 *
 * This file re-exports and organizes all API-related types from the main types.ts file.
 * Import types from here when making API calls or handling API responses.
 *
 * Usage:
 * import type { Login, GetAccountInfo } from '@app/store/api-types';
 *
 * const response: Login.Response = await apiCall();
 * const request: GetAccountInfo.Request = {};
 */

// Re-export all types from the main types file
export * from "./types";

// Re-export commonly used types from feature slices
export type { FeedItem, FeedType, FeedsResponse, GetFeedsParams } from "./features/feeds/types";
export type { Dialog, DialogType, NewMessages } from "./features/dialogs/types";
export type { Account } from "./features/system/types";

// Re-export shared types
export type {
    ApiResponse,
    PaginatedResponse,
    PaginationMeta,
    User,
    BaseUser,
    University,
    Image,
    Country,
    Tag,
    UserPermissions,
    Permission,
    MediaAttachment,
    MessageType,
    DialogMember,
    ProspectInfo,
    Message,
} from "./features/shared/types";
