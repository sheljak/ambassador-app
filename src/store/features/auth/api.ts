import { baseApi } from '../../services/baseApi';
import type {
  Login,
  Logout,
  GetAccountInfo,
  UpdateAccount,
} from '../../types_that_will_used';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<Login.Response, Login.Request>({
      query: (credentials) => ({
        url: 'v1/application/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Account'],
    }),

    // Logout
    logout: builder.mutation<Logout.Response, Logout.Request>({
      query: () => ({
        url: 'v1/application/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Account', 'Profile', 'Dialogs', 'Feeds'],
    }),

    // Get account info
    getAccount: builder.query<GetAccountInfo.Response, void>({
      query: () => 'v1/application/account/info',
      providesTags: ['Account'],
    }),

    // Update account
    updateAccount: builder.mutation<UpdateAccount.Response, UpdateAccount.Request>({
      query: (data) => ({
        url: 'v1/application/account/update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetAccountQuery,
  useLazyGetAccountQuery,
  useUpdateAccountMutation,
} = authApi;
