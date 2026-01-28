import { getBackendUrl, getBackendUrlV2, getConfig, EnvironmentType, setEnvironment } from '../settings';
import type { ApiResponse } from '../features/shared/types';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    useV2?: boolean;
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null): void {
        this.token = token;
    }

    getToken(): string | null {
        return this.token;
    }

    switchEnvironment(env: EnvironmentType): void {
        setEnvironment(env);
    }

    getCurrentConfig() {
        return getConfig();
    }

    private getBaseUrl(useV2: boolean = false): string {
        return useV2 ? getBackendUrlV2() : getBackendUrl();
    }

    private buildUrl(endpoint: string, useV2: boolean = false): string {
        const baseUrl = this.getBaseUrl(useV2);
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${baseUrl}${cleanEndpoint}`;
    }

    private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...customHeaders,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const { method = 'GET', body, headers: customHeaders, useV2 = false } = options;

        const url = this.buildUrl(endpoint, useV2);
        const headers = this.getHeaders(customHeaders);

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    data: null as T,
                    success: false,
                    error: data.message || `HTTP Error: ${response.status}`,
                };
            }

            return {
                data: data as T,
                success: true,
            };
        } catch (error) {
            return {
                data: null as T,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    async get<T>(endpoint: string, useV2: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', useV2 });
    }

    async post<T>(endpoint: string, body?: unknown, useV2: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'POST', body, useV2 });
    }

    async put<T>(endpoint: string, body?: unknown, useV2: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PUT', body, useV2 });
    }

    async patch<T>(endpoint: string, body?: unknown, useV2: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PATCH', body, useV2 });
    }

    async delete<T>(endpoint: string, useV2: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', useV2 });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
