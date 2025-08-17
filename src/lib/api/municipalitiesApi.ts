import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Define proper types
export type Municipality = {
    _id: string;
    municipality_id: number;
    province_id: number;
    municipality_name: string;
};

export type PaginationParams = {
    page?: number;
    limit?: number;
    provinceId?: any;
};

export type PaginationData = {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type ApiResponse<T> = {
    success: boolean;
    data: T;
    pagination: PaginationData;
    message?: string;
};

// Error type for better error handling
export type ApiError = {
    message: string;
    status: number;
    details?: any;
};

/**
 * Custom hook for fetching all municipalities with pagination
 */
export const useGetAllDataMunicipalities = (params: PaginationParams = {}, options?: UseQueryOptions<ApiResponse<Municipality[]>, ApiError>) => {
    const { page = 1, limit = 10, provinceId } = params;

    const getAllDataMunicipalitiesApiRequest = async () => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            if (provinceId !== undefined) {
                queryParams.append('provinceId', provinceId.toString());
            }

            const response = await apiClient.get<ApiResponse<Municipality[]>>(
                `/municipalities?${queryParams.toString()}`
            );

            return response.data;
        } catch (error) {
            // Enhanced error handling
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message: string }>;

                throw {
                    message: axiosError.response?.data?.message || 'Failed to fetch municipalities',
                    status: axiosError.response?.status || 500,
                    details: axiosError.response?.data
                } as ApiError;
            }

            throw {
                message: 'An unexpected error occurred',
                status: 500
            } as ApiError;
        }
    };

    const query = useQuery<ApiResponse<Municipality[]>, ApiError>({
        queryKey: ['municipalities', page, limit, provinceId],
        queryFn: getAllDataMunicipalitiesApiRequest,
        ...options,
        staleTime: 5 * 60 * 1000, // 5 minutes cache before refetching
        retry: (failureCount, error) => {
            // Only retry network issues, not server errors
            return failureCount < 2 && error.status >= 500;
        }
    });

    return {
        municipalities: query.data?.data || [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isFetching: query.isFetching,
        refetch: query.refetch
    };
}; 