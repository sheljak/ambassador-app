import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { FeedItem, FeedType, GetFeedsParams } from '../features/feeds/types';
import type { PaginationMeta } from '../features/shared/types';
import { feedsApi } from '../api/endpoints';

interface FeedsState {
    items: FeedItem[];
    currentType: FeedType;
    meta: PaginationMeta | null;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
}

const initialState: FeedsState = {
    items: [],
    currentType: 'all',
    meta: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
};

export const fetchFeeds = createAsyncThunk(
    'feeds/fetchFeeds',
    async (params: GetFeedsParams | undefined, { rejectWithValue }) => {
        const response = await feedsApi.getFeeds(params);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return response.data;
    }
);

export const likeFeed = createAsyncThunk(
    'feeds/likeFeed',
    async (id: string, { rejectWithValue }) => {
        const response = await feedsApi.likeFeed(id);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return id;
    }
);

export const unlikeFeed = createAsyncThunk(
    'feeds/unlikeFeed',
    async (id: string, { rejectWithValue }) => {
        const response = await feedsApi.unlikeFeed(id);
        if (!response.success) {
            return rejectWithValue(response.error);
        }
        return id;
    }
);

const feedsSlice = createSlice({
    name: 'feeds',
    initialState,
    reducers: {
        setFeedType: (state, action: PayloadAction<FeedType>) => {
            state.currentType = action.payload;
        },
        clearFeeds: (state) => {
            state.items = [];
            state.meta = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeeds.pending, (state, action) => {
                const isRefresh = action.meta.arg?.page === 1;
                state.isLoading = !isRefresh;
                state.isRefreshing = isRefresh;
                state.error = null;
            })
            .addCase(fetchFeeds.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isRefreshing = false;
                state.items = action.payload.feeds;
                state.meta = action.payload.meta;
            })
            .addCase(fetchFeeds.rejected, (state, action) => {
                state.isLoading = false;
                state.isRefreshing = false;
                state.error = action.payload as string;
            })
            .addCase(likeFeed.fulfilled, (state, action) => {
                const item = state.items.find(i => i.id === action.payload);
                if (item) {
                    item.isLiked = true;
                    item.likesCount += 1;
                }
            })
            .addCase(unlikeFeed.fulfilled, (state, action) => {
                const item = state.items.find(i => i.id === action.payload);
                if (item) {
                    item.isLiked = false;
                    item.likesCount -= 1;
                }
            });
    },
});

export const { setFeedType, clearFeeds } = feedsSlice.actions;
export default feedsSlice.reducer;
