import type { User, UserPermissions } from '../shared/types';

export interface Account extends User {
    token?: string;
    refreshToken?: string;
    isVerified: boolean;
    isOnboarded: boolean;
    settings: AccountSettings;
}

export interface AccountSettings {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: Account;
    token: string;
    refreshToken: string;
}

export interface GetAccountInfoRequest {}

export interface GetAccountInfoResponse {
    account: Account;
}
