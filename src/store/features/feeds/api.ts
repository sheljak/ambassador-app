import { baseApi } from '../../services/baseApi';
import type {
  GetFeed,
  CreateFeedPost,
  UpdateFeedPost,
  FeedPost,
} from '../../types_that_will_used';

export const feedsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get feeds
    getFeeds: builder.query<GetFeed.Response, GetFeed.Request>({
      query: ({ type = 'all', offset = 0, limit = 10 }) => ({
        url: `v1/application/feed/${type}`,
        params: { offset, limit },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Feeds' as const,
                id,
              })),
              { type: 'Feeds', id: 'LIST' },
            ]
          : [{ type: 'Feeds', id: 'LIST' }],
    }),

    // Get single feed item
    getFeedItem: builder.query<{ success: boolean; data: FeedPost }, number>({
      query: (id) => `v1/application/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Feeds', id }],
    }),

    // Create post
    createPost: builder.mutation<CreateFeedPost.Response, CreateFeedPost.Request>({
      query: (data) => ({
        url: 'v1/application/posts/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Feeds', id: 'LIST' }],
    }),

    // Update post
    updatePost: builder.mutation<
      UpdateFeedPost.Response,
      UpdateFeedPost.Request
    >({
      query: ({ postId, ...data }) => ({
        url: `v1/application/posts/update/${postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Feeds', id: postId },
        { type: 'Feeds', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFeedsQuery,
  useLazyGetFeedsQuery,
  useGetFeedItemQuery,
  useLazyGetFeedItemQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
} = feedsApi;
