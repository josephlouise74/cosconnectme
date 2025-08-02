import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v2';
const API_TIMEOUT = 30000; // 30 seconds

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    status?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}

// HTTP Status Code Messages
const HTTP_STATUS_MESSAGES: Record<number, string> = {
    400: 'Bad Request - Invalid data provided',
    401: 'Unauthorized - Please log in again',
    403: 'Forbidden - You don\'t have permission to access this resource',
    404: 'Not Found - The requested resource was not found',
    409: 'Conflict - Resource already exists',
    422: 'Validation Error - Please check your input',
    429: 'Too Many Requests - Please try again later',
    500: 'Internal Server Error - Something went wrong on our end',
    502: 'Bad Gateway - Service temporarily unavailable',
    503: 'Service Unavailable - Please try again later',
    504: 'Gateway Timeout - Request timed out',
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ?
            localStorage.getItem('accessToken') ||
            sessionStorage.getItem('accessToken') : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID();

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        const message = (error.response?.data as any)?.message ||
            HTTP_STATUS_MESSAGES[status || 0] ||
            error.message ||
            'An unexpected error occurred';

        const apiError: ApiError = {
            message,
            details: error.response?.data,
        };

        // Only add status if it exists
        if (status !== undefined) {
            apiError.status = status;
        }

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                error: apiError,
                originalError: error,
            });
        }

        // Handle specific error types
        if (!error.response) {
            toast.error('Network error - Please check your internet connection');
        } else if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout - Please try again');
        } else if (status && status >= 500) {
            toast.error('Server error - Please try again later');
        } else if (status === 401) {
            // Handle unauthorized - redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                sessionStorage.removeItem('accessToken');
                window.location.href = '/auth/signin';
            }
        } else if (status === 403) {
            toast.error('Access denied - You don\'t have permission for this action');
        } else if (status === 429) {
            toast.error('Too many requests - Please wait a moment before trying again');
        } else if (status && status >= 400) {
            toast.error(apiError.message);
        }

        return Promise.reject(apiError);
    }
);

// API Client Methods
export const api = {
    // GET request
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await apiClient.get<ApiResponse<T>>(url, config);
        return response.data;
    },

    // POST request
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await apiClient.post<ApiResponse<T>>(url, data, config);
        return response.data;
    },

    // PUT request
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await apiClient.put<ApiResponse<T>>(url, data, config);
        return response.data;
    },

    // PATCH request
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
        return response.data;
    },

    // DELETE request
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await apiClient.delete<ApiResponse<T>>(url, config);
        return response.data;
    },

};

// Utility functions
export const createQueryKey = (base: string, params?: Record<string, any>) => {
    return [base, params].filter(Boolean);
};

export const createMutationKey = (base: string, params?: Record<string, any>) => {
    return [base, 'mutation', params].filter(Boolean);
};

// Retry configuration for React Query
export const retryConfig = {
    retry: (failureCount: number, error: ApiError) => {
        // Don't retry on client errors (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
            return false;
        }
        // Retry up to 3 times for server errors
        return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Default query options
export const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...retryConfig,
};

// Default mutation options
export const defaultMutationOptions = {
    retry: false, // Don't retry mutations by default
    onError: (error: ApiError) => {
        console.error('Mutation error:', error);
    },
}; 