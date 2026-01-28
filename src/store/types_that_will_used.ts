/**
 * API Endpoints Types
 *
 * This file contains TypeScript types for all API endpoints extracted from API logs.
 * Types are organized by endpoint and include request/response structures.
 * Common/reusable types are defined at the top to avoid duplication.
 */
/* eslint-disable @typescript-eslint/no-namespace */

// ============================================================================
// COMMON TYPES (Reusable across endpoints)
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * University permission
 */
export interface UniversityPermission {
    key: string;
    is_enabled: boolean;
}

/**
 * University information
 */
export interface University {
    id: number;
    name: string;
    access_code?: string;
    privacy_policy?: string;
    is_sso_activated?: boolean;
    avatar_id?: number;
    created_at?: string;
    updated_at?: string;
    university_url?: string;
    keywords_censore?: boolean;
    is_test?: boolean;
    data_management_term?: number;
    wizard_setup_passed?: boolean;
    institution_type_id?: number | null;
    is_sso_only_activated?: boolean | null;
    avatar?: Image;
    permissions?: UniversityPermission[];
}

/**
 * Image/Avatar structure
 */
export interface Image {
    id: number;
    uuid: string;
    original: string;
    sizes?: Record<string, string>;
    created_at?: string;
    updated_at?: string;
    original_background?: string;
}

/**
 * User/Account information
 */
export interface User {
    id: number;
    name?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    phone?: string | null;
    avatar?: Image | null;
    university?: University;
    university_id?: number;
    roles?: string[];
    permissions?: UserPermissions;
    additionalData?: UserAdditionalData;
    user_tags?: UserTags;
    shouldUpdateInterests?: boolean;
    platformPrivacyPolicyAccepted?: boolean;
    isIpConsentAccepted?: boolean;
    notifications_from_prospect?: boolean;
    welcome_introduction?: boolean;
    is_ambassador_allowed?: boolean | null;
    introduction?: string;
    description?: string;
    region?: string;
    quizzesPassed?: unknown[];
    children?: unknown[];
}

/**
 * User tag item structure
 */
export interface UserTagItem {
    id: number;
    name: string;
    key: string;
    code?: string;
    is_active: boolean;
    is_hidden: boolean;
    parents: Array<{ name: string }>;
}

/**
 * User tags structure
 */
export interface UserTags {
    countries?: UserTagItem[];
    profile?: UserTagItem[];
    student?: UserTagItem[];
    year_of_study?: UserTagItem[];
    subject?: UserTagItem[];
    courses_types?: UserTagItem[];
    interests?: UserTagItem[];
    [key: string]: UserTagItem[] | undefined;
}

/**
 * User permissions
 */
export interface UserPermissions {
    faq?: Permission;
    content?: Permission;
    chat?: Permission;
    idp_community?: Permission;
    idp_conversion_chat?: Permission;
    idp_what_uni?: Permission;
    [key: string]: Permission | undefined;
}

export interface Permission {
    is_enabled: boolean;
    id: number;
}

/**
 * User additional data
 */
export interface UserAdditionalData {
    working_since?: string | null;
    company_id?: number | null;
    company_country_id?: number | null;
    company_name?: string | null;
    company_country_name?: string | null;
    company_region?: string | null;
}

/**
 * Country information
 */
export interface Country {
    id: number;
    name: string;
    alpha2Code: string;
    key: string;
}

/**
 * SSO Active status
 */
export interface SsoActive {
    id: number;
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/auth/registration/access_code
 * Get university access code information
 */
export namespace GetAccessCode {
    export interface Request {
        access_code?: string;
    }

    export type Response = ApiResponse<{
        university: University;
        isSsoActive: SsoActive | null;
    }>;
}

/**
 * POST /v1/application/auth/login
 * User login
 */
export namespace Login {
    export interface Request {
        email: string;
        password: string;
        fingerprint?: string;
        [key: string]: unknown; // Allow additional fields from app settings
    }

    export type Response = ApiResponse<{
        token: string;
        user?: User;
    }>;
}

/**
 * POST /v1/application/auth/registration
 * User registration
 */
export namespace Registration {
    export interface Request {
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
        access_code?: string;
        fingerprint?: string;
        [key: string]: unknown; // Allow additional fields
    }

    export type Response = ApiResponse<{
        token: string;
        user?: User;
    }>;
}

// ============================================================================
// ACCOUNT ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/account/info
 * Get current user account information
 */
export namespace GetAccountInfo {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{
        account: User;
        timeIsUp: boolean;
        all_done: boolean;
        newMessages: {
            newMessagesChat: number;
            newMessagesContentGroup: number;
            newMessagesFAQ: number;
        };
    }>;
}

/**
 * PUT /v1/application/account/update
 * Update user account
 */
export namespace UpdateAccount {
    export interface Request {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        avatar_id?: number;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v1/application/auth/ssoLogin
 * SSO login
 */
export namespace SsoLogin {
    export interface Request {
        token?: string;
        access_code?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{
        token: string;
        user?: User;
    }>;
}

/**
 * PUT /v1/application/account/access_code
 * Set university access code
 */
export namespace SetUniversity {
    export interface Request {
        access_code: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v1/application/account/avatar
 * Set user avatar
 */
export namespace SetAvatar {
    export interface Request {
        file: unknown; // File upload
    }

    export type Response = ApiResponse<{
        avatar: Image;
    }>;
}

/**
 * PUT /v1/application/account/pushNotificationsToken
 * Set notification token
 */
export namespace SetNotificationToken {
    export interface Request {
        token?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * DELETE /v1/application/account/remove-token
 * Remove notification token
 */
export namespace RemoveNotificationToken {
    export interface Request {
        token?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/account/subject
 * Set subject
 */
export namespace SetSubject {
    export interface Request {
        subject: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/coursesType
 * Set course type
 */
export namespace SetCourseType {
    export interface Request {
        course_type: number;
    }

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/country
 * Set country
 */
export namespace SetCountry {
    export interface Request {
        country: number;
        region?: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/interests
 * Set interests
 */
export namespace SetInterests {
    export interface Request {
        interests: number[];
    }

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/industry
 * Set industry
 */
export namespace SetIndustry {
    export interface Request {
        industry: number;
        job_role?: number;
    }

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/introduction
 * Set introduction
 */
export namespace SetIntroduction {
    export interface Request {
        introduction: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v1/application/account/set-info
 * Save registration info
 */
export namespace SaveRegistration {
    export interface Request {
        region?: string;
        introduction?: string;
        description?: string;
        country_id?: number;
        profile_type_id?: number;
        student_type_id?: number;
        staff_type_id?: number;
        year_of_study_id?: number;
        subject?: string;
        course_type_id?: number;
        job_title?: string;
        job_role?: number;
        industry?: number;
        interests?: number[];
        children?: unknown;
        company_name?: string;
        working_since?: string;
        company_country_id?: number;
        company_region?: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v1/application/account/edit/email
 * Get email verification letter
 */
export namespace GetEmailLetter {
    export interface Request {
        email: string;
        password: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/account/edit/email
 * Set new email
 */
export namespace SetEmail {
    export interface Request {
        email: string;
        verification_code: string;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v1/application/account/edit/password
 * Get password verification letter
 */
export namespace GetPasswordLetter {
    export interface Request {
        old_password: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/account/edit/password
 * Set new password
 */
export namespace SetPassword {
    export interface Request {
        old_password: string;
        new_password: string;
        confirm_password: string;
        verification_code: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * DELETE /v1/application/account/delete
 * Delete account
 */
export namespace DeleteAccount {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/application/account/recovery/password
 * Request password recovery
 */
export namespace SetRecoveryEmail {
    export interface Request {
        email: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/application/account/recovery/checkCode
 * Check recovery code
 */
export namespace CheckRecoveryCode {
    export interface Request {
        email: string;
        confirmation_code: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/application/account/recovery/passwordConfirm
 * Confirm password recovery
 */
export namespace SetRecoveryPasswordConfirm {
    export interface Request {
        new_password: string;
        confirm_new_password: string;
        email: string;
        confirmation_code: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/account/emailNotification
 * Toggle email notifications
 */
export namespace SetEmailNotification {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * GET /v1/application/account/profile
 * Get ambassador profile data
 */
export namespace GetAmbassadorData {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<User>;
}

/**
 * PUT /v1/application/account/edit/info
 * Change ambassador data
 */
export namespace ChangeAmbassadorData {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<User>;
}

/**
 * GET /v1/application/account/time/report/:reportType
 * Get ambassador time report
 */
export namespace GetAmbassadorTimeReport {
    export interface Request {
        reportType: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<unknown>;
}

/**
 * PUT /v1/application/account/welcome/introduction
 * Complete registration introduction
 */
export namespace ProceedToCompleteRegistration {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<User>;
}

/**
 * GET /v1/application/auth/getUserSsoData
 * Get user SSO data
 */
export namespace GetUserSsoData {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<User>;
}

/**
 * GET /v1/application/account/hubspotLogin
 * Get HubSpot login token
 */
export namespace GetHubspotLoginToken {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ token: string }>;
}

/**
 * POST /v1/application/auth/logout
 * Logout user
 */
export namespace Logout {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/application/account/check/password
 * Check password
 */
export namespace CheckPassword {
    export interface Request {
        password: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/account/acceptIpConsent
 * Accept IP consent
 */
export namespace AcceptIpConsent {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v2/common/users/platform-privacy-policy/accept
 * Accept platform privacy policy
 */
export namespace AcceptPlatformPrivacyPolicy {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ success: boolean }>;
}

// ============================================================================
// FEED ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/feed/:type
 * Get feed posts
 */
export namespace GetFeed {
    export interface Request {
        type: "all" | "my";
        offset?: number;
        limit?: number;
    }

    export type Response = ApiResponse<PaginatedResponse<FeedPost>>;
}

/**
 * POST /v1/application/posts/create
 * Create feed post
 */
export namespace CreateFeedPost {
    export interface Request {
        caption?: string;
        file?: unknown;
        image?: unknown;
        video?: unknown;
        type?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<FeedPost>;
}

/**
 * PUT /v1/application/posts/update/:id
 * Update feed post
 */
export namespace UpdateFeedPost {
    export interface Request {
        postId: number;
        caption: string;
    }

    export type Response = ApiResponse<FeedPost>;
}

/**
 * Feed post structure
 */
export interface FeedPost {
    id: number;
    type_key?: string;
    content?: string;
    user?: User;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ============================================================================
// DIALOGS/CHAT ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/dialogs
 * Get user dialogs/chats
 */
export namespace GetDialogs {
    export interface Request {
        offset?: number;
        limit?: number;
        types?: string;
        search?: string;
    }

    export type Response = ApiResponse<PaginatedResponse<Dialog>>;
}

/**
 * GET /v1/application/dialogs/:id
 * Get dialog members/info
 */
export namespace GetDialogInfo {
    export interface Request {
        id: number;
    }

    export type Response = ApiResponse<Dialog>;
}

/**
 * PUT /v1/application/dialogs/:id/attachAmbassador
 * Attach ambassador to dialog
 */
export namespace AttachAmbassador {
    export interface Request {
        dialog_id: number;
        user_id: number;
    }

    export type Response = ApiResponse<Dialog>;
}

/**
 * PUT /v1/application/dialogs/:id/detachAmbassador
 * Detach ambassador from dialog
 */
export namespace DetachAmbassador {
    export interface Request {
        dialog_id: number;
        user_id: number;
    }

    export type Response = ApiResponse<Dialog>;
}

/**
 * PUT /v1/application/dialogs/:id/exit
 * Exit dialog
 */
export namespace ExitDialog {
    export interface Request {
        dialog_id: number;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/dialogs/:id/report
 * Report/flag dialog
 */
export namespace ReportDialog {
    export interface Request {
        dialog_id: number;
        reported_reason: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/community/dialogs/:id/report
 * Update dialog report
 */
export namespace UpdateDialogReport {
    export interface Request {
        dialog_id: number;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * POST /v1/application/dialogs/reportMessage
 * Report a message
 */
export namespace ReportMessage {
    export interface Request {
        message_id?: number;
        dialog_id?: number;
        reported_reason?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/dialogs/:id/archive/toggle
 * Toggle dialog archive status
 */
export namespace ToggleDialogArchive {
    export interface Request {
        dialog_id: number;
        socketId?: string;
    }

    export type Response = ApiResponse<Dialog>;
}

/**
 * POST /v1/application/dialogs/create
 * Create new dialog/chat
 */
export namespace CreateDialog {
    export interface Request {
        user_id?: number;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<Dialog>;
}

/**
 * GET /v1/application/dialogs/:id/messages
 * Get messages for a dialog
 */
export namespace GetDialogMessages {
    export interface Request {
        dialog_id: number;
        offset?: number;
        limit?: number;
        aroundMessageId?: number;
        beforeMessageId?: number;
        afterMessageId?: number;
        isFaq?: boolean;
    }

    export type Response = ApiResponse<PaginatedResponse<Message>>;
}

/**
 * POST /v1/application/dialogs/:id/messages/send
 * Send a message
 */
export namespace SendMessage {
    export interface Request {
        dialog_id: number;
        content?: string;
        text?: string;
        type?: string;
        file?: unknown;
        image?: unknown;
        video?: unknown;
        audio?: unknown;
        [key: string]: unknown; // Allow additional message fields
    }

    export type Response = ApiResponse<Message>;
}

/**
 * POST /v1/application/dialogs/:id/messages/view
 * Mark messages as viewed
 */
export namespace ViewMessages {
    export interface Request {
        dialog_id: number;
        message_ids?: number[];
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * GET /v1/application/dialogs/prospectInfo
 * Get prospect information
 */
export namespace GetProspectInfo {
    export interface Request {
        prospectId?: number;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<User>;
}

/**
 * POST /v2/common/users/prospects/block-toggle
 * Block/unblock a user
 */
export namespace BlockToggleUser {
    export interface Request {
        userId: number;
        isBlocked: boolean;
        blockingReason?: string;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * Dialog/Chat structure
 */
export interface Dialog {
    id: number;
    name?: string;
    type?: string;
    last_message?: Message;
    participants?: User[];
    [key: string]: unknown;
}

/**
 * Message structure
 */
export interface Message {
    id: number;
    content?: string;
    text?: string;
    type?: string;
    user?: User;
    created_at?: string;
    dialog_id?: number;
    file?: Image;
    image?: Image;
    video?: unknown;
    audio?: unknown;
    [key: string]: unknown;
}

// ============================================================================
// UNIVERSITIES ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/universities
 * Get universities list
 */
export namespace GetUniversities {
    export interface Request {
        search?: string;
        page?: number;
        limit?: number;
    }

    export type Response = ApiResponse<PaginatedResponse<University>>;
}

// ============================================================================
// FEEDBACK ENDPOINTS
// ============================================================================

/**
 * GET /v1/application/dialogs/:id/feedback
 * Get feedback info
 */
export namespace GetFeedbackInfo {
    export interface Request {
        dialog_id: number;
    }

    export type Response = ApiResponse<unknown>;
}

/**
 * POST /v1/application/dialogs/:id/feedback
 * Leave feedback
 */
export namespace LeaveFeedback {
    export interface Request {
        dialog_id: number;
        rating?: number;
        comment?: string;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

/**
 * PUT /v1/application/dialogs/:id/afteDialogReport
 * Leave ambassador feedback
 */
export namespace LeaveAmbassadorFeedback {
    export interface Request {
        dialog_id: number;
        [key: string]: unknown;
    }

    export type Response = ApiResponse<{ success: boolean }>;
}

// ============================================================================
// COMMON DATA ENDPOINTS
// ============================================================================

/**
 * GET /v1/common/data/countries
 * Get countries list
 */
export namespace GetCountries {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<Country[]>;
}

/**
 * GET /v1/common/data/ambassador/profileTypes
 * Get profile types
 */
export namespace GetProfileTypes {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/studentTypes
 * Get student types
 */
export namespace GetStudentTypes {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/staffTypes
 * Get staff types
 */
export namespace GetStaffTypes {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/subjects
 * Get subjects
 */
export namespace GetSubjects {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/yearOfStudies
 * Get year of study options
 */
export namespace GetYearOfStudy {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/industries
 * Get industries
 */
export namespace GetIndustries {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/data/courseTypes
 * Get course types
 */
export namespace GetCourseTypes {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/application/account/companies
 * Get companies
 */
export namespace GetCompanies {
    export interface Request {
        [key: string]: unknown;
    }

    export type Response = ApiResponse<unknown[]>;
}

/**
 * GET /v1/common/account/careerReference/pdf
 * Get career reference PDF
 */
export namespace GetCareerReferencePdf {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ url: string }>;
}

/**
 * GET /v1/application/account/getCareerReferenceText
 * Get career reference text
 */
export namespace GetCareerReferenceText {
    export type Request = Record<string, never>;

    export type Response = ApiResponse<{ text: string }>;
}

// ============================================================================
// ENDPOINT MAP (for use in store/services)
// ============================================================================

/**
 * Endpoint configuration map
 * Maps endpoint paths to their request/response types
 */
export interface EndpointConfig {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    requestType?: string;
    responseType?: string;
}

/**
 * All available endpoints with their types
 */
export const ENDPOINTS: Record<string, EndpointConfig> = {
    // Auth
    GET_ACCESS_CODE: {
        method: "GET",
        path: "/v1/application/auth/registration/access_code",
        requestType: "GetAccessCode.Request",
        responseType: "GetAccessCode.Response",
    },
    LOGIN: {
        method: "POST",
        path: "/v1/application/auth/login",
        requestType: "Login.Request",
        responseType: "Login.Response",
    },
    REGISTRATION: {
        method: "POST",
        path: "/v1/application/auth/registration",
        requestType: "Registration.Request",
        responseType: "Registration.Response",
    },
    // Account
    GET_ACCOUNT_INFO: {
        method: "GET",
        path: "/v1/application/account/info",
        requestType: "GetAccountInfo.Request",
        responseType: "GetAccountInfo.Response",
    },
    UPDATE_ACCOUNT: {
        method: "PUT",
        path: "/v1/application/account/update",
        requestType: "UpdateAccount.Request",
        responseType: "UpdateAccount.Response",
    },
    // Feed
    GET_FEED: {
        method: "GET",
        path: "/v1/application/feed",
        requestType: "GetFeed.Request",
        responseType: "GetFeed.Response",
    },
    // Dialogs
    GET_DIALOGS: {
        method: "GET",
        path: "/v1/application/dialogs",
        requestType: "GetDialogs.Request",
        responseType: "GetDialogs.Response",
    },
    GET_DIALOG_INFO: {
        method: "GET",
        path: "/v1/application/dialogs/:id",
        requestType: "GetDialogInfo.Request",
        responseType: "GetDialogInfo.Response",
    },
    ATTACH_AMBASSADOR: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/attachAmbassador",
        requestType: "AttachAmbassador.Request",
        responseType: "AttachAmbassador.Response",
    },
    DETACH_AMBASSADOR: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/detachAmbassador",
        requestType: "DetachAmbassador.Request",
        responseType: "DetachAmbassador.Response",
    },
    EXIT_DIALOG: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/exit",
        requestType: "ExitDialog.Request",
        responseType: "ExitDialog.Response",
    },
    REPORT_DIALOG: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/report",
        requestType: "ReportDialog.Request",
        responseType: "ReportDialog.Response",
    },
    UPDATE_DIALOG_REPORT: {
        method: "POST",
        path: "/v1/community/dialogs/:id/report",
        requestType: "UpdateDialogReport.Request",
        responseType: "UpdateDialogReport.Response",
    },
    REPORT_MESSAGE: {
        method: "POST",
        path: "/v1/application/dialogs/reportMessage",
        requestType: "ReportMessage.Request",
        responseType: "ReportMessage.Response",
    },
    TOGGLE_DIALOG_ARCHIVE: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/archive/toggle",
        requestType: "ToggleDialogArchive.Request",
        responseType: "ToggleDialogArchive.Response",
    },
    CREATE_DIALOG: {
        method: "POST",
        path: "/v1/application/dialogs/create",
        requestType: "CreateDialog.Request",
        responseType: "CreateDialog.Response",
    },
    GET_DIALOG_MESSAGES: {
        method: "GET",
        path: "/v1/application/dialogs/:id/messages",
        requestType: "GetDialogMessages.Request",
        responseType: "GetDialogMessages.Response",
    },
    SEND_MESSAGE: {
        method: "POST",
        path: "/v1/application/dialogs/:id/messages/send",
        requestType: "SendMessage.Request",
        responseType: "SendMessage.Response",
    },
    VIEW_MESSAGES: {
        method: "POST",
        path: "/v1/application/dialogs/:id/messages/view",
        requestType: "ViewMessages.Request",
        responseType: "ViewMessages.Response",
    },
    GET_PROSPECT_INFO: {
        method: "GET",
        path: "/v1/application/dialogs/prospectInfo",
        requestType: "GetProspectInfo.Request",
        responseType: "GetProspectInfo.Response",
    },
    BLOCK_TOGGLE_USER: {
        method: "POST",
        path: "/v2/common/users/prospects/block-toggle",
        requestType: "BlockToggleUser.Request",
        responseType: "BlockToggleUser.Response",
    },
    // Universities
    GET_UNIVERSITIES: {
        method: "GET",
        path: "/v1/application/universities",
        requestType: "GetUniversities.Request",
        responseType: "GetUniversities.Response",
    },
    // Common Data
    // Feedback
    GET_FEEDBACK_INFO: {
        method: "GET",
        path: "/v1/application/dialogs/:id/feedback",
        requestType: "GetFeedbackInfo.Request",
        responseType: "GetFeedbackInfo.Response",
    },
    LEAVE_FEEDBACK: {
        method: "POST",
        path: "/v1/application/dialogs/:id/feedback",
        requestType: "LeaveFeedback.Request",
        responseType: "LeaveFeedback.Response",
    },
    LEAVE_AMBASSADOR_FEEDBACK: {
        method: "PUT",
        path: "/v1/application/dialogs/:id/afteDialogReport",
        requestType: "LeaveAmbassadorFeedback.Request",
        responseType: "LeaveAmbassadorFeedback.Response",
    },
    // Feed Posts
    CREATE_FEED_POST: {
        method: "POST",
        path: "/v1/application/posts/create",
        requestType: "CreateFeedPost.Request",
        responseType: "CreateFeedPost.Response",
    },
    UPDATE_FEED_POST: {
        method: "PUT",
        path: "/v1/application/posts/update/:id",
        requestType: "UpdateFeedPost.Request",
        responseType: "UpdateFeedPost.Response",
    },
    // Account - Additional
    SSO_LOGIN: {
        method: "POST",
        path: "/v1/application/auth/ssoLogin",
        requestType: "SsoLogin.Request",
        responseType: "SsoLogin.Response",
    },
    SET_UNIVERSITY: {
        method: "PUT",
        path: "/v1/application/account/access_code",
        requestType: "SetUniversity.Request",
        responseType: "SetUniversity.Response",
    },
    SET_AVATAR: {
        method: "POST",
        path: "/v1/application/account/avatar",
        requestType: "SetAvatar.Request",
        responseType: "SetAvatar.Response",
    },
    SET_NOTIFICATION_TOKEN: {
        method: "PUT",
        path: "/v1/application/account/pushNotificationsToken",
        requestType: "SetNotificationToken.Request",
        responseType: "SetNotificationToken.Response",
    },
    REMOVE_NOTIFICATION_TOKEN: {
        method: "DELETE",
        path: "/v1/application/account/remove-token",
        requestType: "RemoveNotificationToken.Request",
        responseType: "RemoveNotificationToken.Response",
    },
    SET_SUBJECT: {
        method: "PUT",
        path: "/v1/application/account/subject",
        requestType: "SetSubject.Request",
        responseType: "SetSubject.Response",
    },
    SET_COURSE_TYPE: {
        method: "PUT",
        path: "/v1/application/account/coursesType",
        requestType: "SetCourseType.Request",
        responseType: "SetCourseType.Response",
    },
    SET_COUNTRY: {
        method: "PUT",
        path: "/v1/application/account/country",
        requestType: "SetCountry.Request",
        responseType: "SetCountry.Response",
    },
    SET_INTERESTS: {
        method: "PUT",
        path: "/v1/application/account/interests",
        requestType: "SetInterests.Request",
        responseType: "SetInterests.Response",
    },
    SET_INDUSTRY: {
        method: "PUT",
        path: "/v1/application/account/industry",
        requestType: "SetIndustry.Request",
        responseType: "SetIndustry.Response",
    },
    SET_INTRODUCTION: {
        method: "PUT",
        path: "/v1/application/account/introduction",
        requestType: "SetIntroduction.Request",
        responseType: "SetIntroduction.Response",
    },
    SAVE_REGISTRATION: {
        method: "POST",
        path: "/v1/application/account/set-info",
        requestType: "SaveRegistration.Request",
        responseType: "SaveRegistration.Response",
    },
    GET_EMAIL_LETTER: {
        method: "POST",
        path: "/v1/application/account/edit/email",
        requestType: "GetEmailLetter.Request",
        responseType: "GetEmailLetter.Response",
    },
    SET_EMAIL: {
        method: "PUT",
        path: "/v1/application/account/edit/email",
        requestType: "SetEmail.Request",
        responseType: "SetEmail.Response",
    },
    GET_PASSWORD_LETTER: {
        method: "POST",
        path: "/v1/application/account/edit/password",
        requestType: "GetPasswordLetter.Request",
        responseType: "GetPasswordLetter.Response",
    },
    SET_PASSWORD: {
        method: "PUT",
        path: "/v1/application/account/edit/password",
        requestType: "SetPassword.Request",
        responseType: "SetPassword.Response",
    },
    DELETE_ACCOUNT: {
        method: "DELETE",
        path: "/v1/application/account/delete",
        requestType: "DeleteAccount.Request",
        responseType: "DeleteAccount.Response",
    },
    SET_RECOVERY_EMAIL: {
        method: "POST",
        path: "/v1/application/account/recovery/password",
        requestType: "SetRecoveryEmail.Request",
        responseType: "SetRecoveryEmail.Response",
    },
    CHECK_RECOVERY_CODE: {
        method: "POST",
        path: "/v1/application/account/recovery/checkCode",
        requestType: "CheckRecoveryCode.Request",
        responseType: "CheckRecoveryCode.Response",
    },
    SET_RECOVERY_PASSWORD_CONFIRM: {
        method: "POST",
        path: "/v1/application/account/recovery/passwordConfirm",
        requestType: "SetRecoveryPasswordConfirm.Request",
        responseType: "SetRecoveryPasswordConfirm.Response",
    },
    SET_EMAIL_NOTIFICATION: {
        method: "PUT",
        path: "/v1/application/account/emailNotification",
        requestType: "SetEmailNotification.Request",
        responseType: "SetEmailNotification.Response",
    },
    GET_AMBASSADOR_DATA: {
        method: "GET",
        path: "/v1/application/account/profile",
        requestType: "GetAmbassadorData.Request",
        responseType: "GetAmbassadorData.Response",
    },
    CHANGE_AMBASSADOR_DATA: {
        method: "PUT",
        path: "/v1/application/account/edit/info",
        requestType: "ChangeAmbassadorData.Request",
        responseType: "ChangeAmbassadorData.Response",
    },
    GET_AMBASSADOR_TIME_REPORT: {
        method: "GET",
        path: "/v1/application/account/time/report/:reportType",
        requestType: "GetAmbassadorTimeReport.Request",
        responseType: "GetAmbassadorTimeReport.Response",
    },
    PROCEED_TO_COMPLETE_REGISTRATION: {
        method: "PUT",
        path: "/v1/application/account/welcome/introduction",
        requestType: "ProceedToCompleteRegistration.Request",
        responseType: "ProceedToCompleteRegistration.Response",
    },
    GET_USER_SSO_DATA: {
        method: "GET",
        path: "/v1/application/auth/getUserSsoData",
        requestType: "GetUserSsoData.Request",
        responseType: "GetUserSsoData.Response",
    },
    GET_HUBSPOT_LOGIN_TOKEN: {
        method: "GET",
        path: "/v1/application/account/hubspotLogin",
        requestType: "GetHubspotLoginToken.Request",
        responseType: "GetHubspotLoginToken.Response",
    },
    LOGOUT: {
        method: "POST",
        path: "/v1/application/auth/logout",
        requestType: "Logout.Request",
        responseType: "Logout.Response",
    },
    CHECK_PASSWORD: {
        method: "POST",
        path: "/v1/application/account/check/password",
        requestType: "CheckPassword.Request",
        responseType: "CheckPassword.Response",
    },
    ACCEPT_IP_CONSENT: {
        method: "PUT",
        path: "/v1/application/account/acceptIpConsent",
        requestType: "AcceptIpConsent.Request",
        responseType: "AcceptIpConsent.Response",
    },
    ACCEPT_PLATFORM_PRIVACY_POLICY: {
        method: "POST",
        path: "/v2/common/users/platform-privacy-policy/accept",
        requestType: "AcceptPlatformPrivacyPolicy.Request",
        responseType: "AcceptPlatformPrivacyPolicy.Response",
    },
    // Common Data
    GET_COUNTRIES: {
        method: "GET",
        path: "/v1/common/data/countries",
        requestType: "GetCountries.Request",
        responseType: "GetCountries.Response",
    },
    GET_PROFILE_TYPES: {
        method: "GET",
        path: "/v1/common/data/ambassador/profileTypes",
        requestType: "GetProfileTypes.Request",
        responseType: "GetProfileTypes.Response",
    },
    GET_STUDENT_TYPES: {
        method: "GET",
        path: "/v1/common/data/studentTypes",
        requestType: "GetStudentTypes.Request",
        responseType: "GetStudentTypes.Response",
    },
    GET_STAFF_TYPES: {
        method: "GET",
        path: "/v1/common/data/staffTypes",
        requestType: "GetStaffTypes.Request",
        responseType: "GetStaffTypes.Response",
    },
    GET_SUBJECTS: {
        method: "GET",
        path: "/v1/common/data/subjects",
        requestType: "GetSubjects.Request",
        responseType: "GetSubjects.Response",
    },
    GET_YEAR_OF_STUDY: {
        method: "GET",
        path: "/v1/common/data/yearOfStudies",
        requestType: "GetYearOfStudy.Request",
        responseType: "GetYearOfStudy.Response",
    },
    GET_INDUSTRIES: {
        method: "GET",
        path: "/v1/common/data/industries",
        requestType: "GetIndustries.Request",
        responseType: "GetIndustries.Response",
    },
    GET_COURSE_TYPES: {
        method: "GET",
        path: "/v1/common/data/courseTypes",
        requestType: "GetCourseTypes.Request",
        responseType: "GetCourseTypes.Response",
    },
    GET_COMPANIES: {
        method: "GET",
        path: "/v1/application/account/companies",
        requestType: "GetCompanies.Request",
        responseType: "GetCompanies.Response",
    },
    GET_CAREER_REFERENCE_PDF: {
        method: "GET",
        path: "/v1/common/account/careerReference/pdf",
        requestType: "GetCareerReferencePdf.Request",
        responseType: "GetCareerReferencePdf.Response",
    },
    GET_CAREER_REFERENCE_TEXT: {
        method: "GET",
        path: "/v1/application/account/getCareerReferenceText",
        requestType: "GetCareerReferenceText.Request",
        responseType: "GetCareerReferenceText.Response",
    },
} as const;

/**
 * Type helper to get request type for an endpoint
 * Note: For full type safety, import the specific namespace types directly
 * Example: import type { SendMessage } from './types';
 *          const request: SendMessage.Request = { ... };
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- generic used for API consistency
export type EndpointRequestType<T extends keyof typeof ENDPOINTS> = unknown;

/**
 * Type helper to get response type for an endpoint
 * Note: For full type safety, import the specific namespace types directly
 * Example: import type { SendMessage } from './types';
 *          const response: SendMessage.Response = await apiCall();
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- generic used for API consistency
export type EndpointResponseType<T extends keyof typeof ENDPOINTS> = unknown;

// ============================================================================
// USAGE IN STORE EXAMPLE
// ============================================================================

/**
 * Example usage in Redux Saga:
 *
 * import { ENDPOINTS } from '../api/endpoints';
 * import type { Login } from '../api/endpoints/types';
 *
 * function* loginSaga(action) {
 *   const endpoint = ENDPOINTS.LOGIN;
 *   const response: Login.Response = yield call(HttpService.post, endpoint.path, action.payload);
 *   // Use typed response
 * }
 *
 * Example usage in API service:
 *
 * import { ENDPOINTS } from './endpoints';
 * import type { GetAccountInfo } from './endpoints/types';
 *
 * export const accountApi = {
 *   getInfo: async (): Promise<GetAccountInfo.Response> => {
 *     const endpoint = ENDPOINTS.GET_ACCOUNT_INFO;
 *     return HttpService.get(endpoint.path);
 *   }
 * };
 */

// ============================================================================
// ENDPOINT STATISTICS
// ============================================================================
// Total API Endpoints: 69
//
// Breakdown by category:
// - Authentication: 3 endpoints
// - Account Management: 30+ endpoints
// - Dialogs/Chat: 15 endpoints
// - Messages: 3 endpoints
// - Feed/Posts: 3 endpoints
// - Feedback: 3 endpoints
// - Universities: 1 endpoint
// - Common Data: 11 endpoints
//
// All endpoints include full TypeScript types for both Request and Response.
// Use ENDPOINTS map for endpoint configuration and import specific namespace
// types (e.g., SendMessage.Request) for type-safe API calls.
