import { baseApi } from '../../services/baseApi';
import type { GetLeaderboard } from '../../types_that_will_used';

export const leaderboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<GetLeaderboard.Response, GetLeaderboard.Request>({
      query: ({ offset = 0, limit = 20 }) => ({
        url: 'v1/application/leaderboard',
        params: { offset, limit },
      }),
      providesTags: ['Leaderboard'],
    }),
  }),
});

export const { useGetLeaderboardQuery, useLazyGetLeaderboardQuery } = leaderboardApi;
