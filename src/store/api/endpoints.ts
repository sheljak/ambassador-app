import apiClient from './client';
import type { Login, GetAccountInfo, GetFeeds, GetDialogs } from '../types';

export const authApi = {
    login: (credentials: Login.Request) => 
        apiClient.post<Login.Response>('/auth/login', credentials),
    
    logout: () => 
        apiClient.post<void>('/auth/logout'),
    
    refreshToken: (refreshToken: string) => 
        apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
};

export const accountApi = {
    getInfo: () => 
        apiClient.get<GetAccountInfo.Response>('/account'),
    
    updateProfile: (data: Partial<GetAccountInfo.Response['account']>) => 
        apiClient.patch<GetAccountInfo.Response>('/account', data),
};

export const feedsApi = {
    getFeeds: (params?: GetFeeds.Request) => {
        const queryString = params 
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : '';
        return apiClient.get<GetFeeds.Response>(`/feeds${queryString}`);
    },
    
    getFeedItem: (id: string) => 
        apiClient.get<{ feed: import('../types').FeedItem }>(`/feeds/${id}`),
    
    likeFeed: (id: string) => 
        apiClient.post<void>(`/feeds/${id}/like`),
    
    unlikeFeed: (id: string) => 
        apiClient.delete<void>(`/feeds/${id}/like`),
};

export const dialogsApi = {
    getDialogs: (params?: GetDialogs.Request) => {
        const queryString = params 
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : '';
        return apiClient.get<GetDialogs.Response>(`/dialogs${queryString}`);
    },
    
    getDialog: (id: string) => 
        apiClient.get<{ dialog: import('../types').Dialog }>(`/dialogs/${id}`),
    
    getMessages: (dialogId: string, page?: number) => 
        apiClient.get<{ messages: import('../types').Message[] }>(
            `/dialogs/${dialogId}/messages${page ? `?page=${page}` : ''}`
        ),
    
    sendMessage: (dialogId: string, content: string, type: import('../types').MessageType = 'text') => 
        apiClient.post<{ message: import('../types').Message }>(
            `/dialogs/${dialogId}/messages`, 
            { content, type }
        ),
};

export const api = {
    auth: authApi,
    account: accountApi,
    feeds: feedsApi,
    dialogs: dialogsApi,
};

export default api;
