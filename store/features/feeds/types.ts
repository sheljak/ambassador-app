import type { User, Image, Tag, PaginatedResponse } from '../shared/types';

export type FeedType = 'all' | 'following' | 'trending' | 'university';

export interface FeedItem {
    id: string;
    type: 'post' | 'event' | 'announcement';
    author: User;
    content: string;
    images?: Image[];
    tags?: Tag[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface GetFeedsParams {
    type?: FeedType;
    page?: number;
    limit?: number;
    universityId?: string;
    searchQuery?: string;
}

export type FeedsResponse = PaginatedResponse<FeedItem>;
