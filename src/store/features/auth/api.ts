import { baseApi } from '../../services/baseApi';
import type {
  Login,
  Logout,
  GetAccountInfo,
  UpdateAccount,
  GetAmbassadorData,
  ChangeAmbassadorData,
  SetAvatar,
  GetCountries,
  GetProfileTypes,
  GetStudentTypes,
  GetStaffTypes,
  GetSubjects,
  GetYearOfStudy,
  GetIndustries,
  GetCourseTypes,
  SetInterests,
  GetPasswordLetter,
  SetPassword,
  GetEmailLetter,
  SetEmail,
  GetCareerReferenceText,
  GetCareerReferencePdf,
  SetEmailNotification,
  DeleteAccount,
  GetHubspotLoginToken,
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

    // Get ambassador profile data (points, profile info)
    getAmbassadorData: builder.query<GetAmbassadorData.Response, void>({
      query: () => 'v1/application/account/profile',
      providesTags: ['Profile'],
    }),

    // Update ambassador profile info
    changeAmbassadorData: builder.mutation<ChangeAmbassadorData.Response, ChangeAmbassadorData.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/info',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),

    // Save profile info (alias for changeAmbassadorData)
    saveProfileInfo: builder.mutation<ChangeAmbassadorData.Response, ChangeAmbassadorData.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/info',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),

    // Set profile info via POST /v1/application/account/set-info
    setProfileInfo: builder.mutation<ChangeAmbassadorData.Response, ChangeAmbassadorData.Request>({
      query: (data) => ({
        url: 'v1/application/account/set-info',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),

    // Set avatar
    setAvatar: builder.mutation<SetAvatar.Response, SetAvatar.Request>({
      query: (data) => ({
        url: 'v1/application/account/avatar',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),

    // Set interests
    setInterests: builder.mutation<SetInterests.Response, SetInterests.Request>({
      query: (data) => ({
        url: 'v1/application/account/interests',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account', 'Profile'],
    }),

    // Get interests list
    getInterests: builder.query<SetInterests.Response, void>({
      query: () => 'v1/common/data/interests',
    }),

    // Common data endpoints
    getCountries: builder.query<GetCountries.Response, void>({
      query: () => 'v1/common/data/countries',
    }),

    getProfileTypes: builder.query<GetProfileTypes.Response, void>({
      query: () => 'v1/common/data/ambassador/profileTypes',
    }),

    getStudentTypes: builder.query<GetStudentTypes.Response, void>({
      query: () => 'v1/common/data/studentTypes',
    }),

    getStaffTypes: builder.query<GetStaffTypes.Response, void>({
      query: () => 'v1/common/data/staffTypes',
    }),

    getSubjects: builder.query<GetSubjects.Response, void>({
      query: () => 'v1/common/data/subjects',
    }),

    getYearOfStudy: builder.query<GetYearOfStudy.Response, void>({
      query: () => 'v1/common/data/yearOfStudies',
    }),

    getIndustries: builder.query<GetIndustries.Response, void>({
      query: () => 'v1/common/data/industries',
    }),

    getCourseTypes: builder.query<GetCourseTypes.Response, void>({
      query: () => 'v1/common/data/courseTypes',
    }),

    // Password management
    getPasswordLetter: builder.mutation<GetPasswordLetter.Response, GetPasswordLetter.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/password',
        method: 'POST',
        body: data,
      }),
    }),

    setPassword: builder.mutation<SetPassword.Response, SetPassword.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/password',
        method: 'PUT',
        body: data,
      }),
    }),

    // Email management
    getEmailLetter: builder.mutation<GetEmailLetter.Response, GetEmailLetter.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/email',
        method: 'POST',
        body: data,
      }),
    }),

    setEmail: builder.mutation<SetEmail.Response, SetEmail.Request>({
      query: (data) => ({
        url: 'v1/application/account/edit/email',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),

    // Career reference
    getCareerReferenceText: builder.query<GetCareerReferenceText.Response, void>({
      query: () => 'v1/application/account/getCareerReferenceText',
    }),

    sendCareerReferencePdf: builder.mutation<GetCareerReferencePdf.Response, void>({
      query: () => ({
        url: 'v1/common/account/careerReference/pdf',
        method: 'GET',
      }),
    }),

    // Email notification toggle
    toggleEmailNotification: builder.mutation<SetEmailNotification.Response, void>({
      query: () => ({
        url: 'v1/application/account/emailNotification',
        method: 'PUT',
      }),
      invalidatesTags: ['Account'],
    }),

    // Delete account
    deleteAccount: builder.mutation<DeleteAccount.Response, DeleteAccount.Request>({
      query: (data) => ({
        url: 'v1/application/account/delete',
        method: 'DELETE',
        body: data,
      }),
    }),

    // HubSpot login token
    getHubspotToken: builder.query<GetHubspotLoginToken.Response, void>({
      query: () => 'v1/application/account/hubspotLogin',
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetAccountQuery,
  useLazyGetAccountQuery,
  useUpdateAccountMutation,
  useGetAmbassadorDataQuery,
  useChangeAmbassadorDataMutation,
  useSaveProfileInfoMutation,
  useSetProfileInfoMutation,
  useSetAvatarMutation,
  useSetInterestsMutation,
  useGetInterestsQuery,
  useGetCountriesQuery,
  useGetProfileTypesQuery,
  useGetStudentTypesQuery,
  useGetStaffTypesQuery,
  useGetSubjectsQuery,
  useGetYearOfStudyQuery,
  useGetIndustriesQuery,
  useGetCourseTypesQuery,
  useGetPasswordLetterMutation,
  useSetPasswordMutation,
  useGetEmailLetterMutation,
  useSetEmailMutation,
  useGetCareerReferenceTextQuery,
  useSendCareerReferencePdfMutation,
  useToggleEmailNotificationMutation,
  useDeleteAccountMutation,
  useGetHubspotTokenQuery,
  useLazyGetHubspotTokenQuery,
} = authApi;
