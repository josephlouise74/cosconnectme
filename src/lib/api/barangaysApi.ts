// hooks/useGetAllDataBarangays.ts

import { useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";
import { Barangay } from "../types/philippineDataType";

const API_BASE_URL = "https://tupv-dormitory-server-4pgk.onrender.com/api/v1";

// Create a Ky instance with default configurations
const apiClient = ky.create({
    prefixUrl: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    retry: {
        limit: 3,
        methods: ['get'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        backoffLimit: 3000,
    },
    hooks: {
        beforeRetry: [
            ({ request, retryCount }) => {
                console.log(`Retrying request to ${request.url} (attempt ${retryCount + 1})`);
            }
        ]
    }
});



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

export type ApiError = {
    message: string;
    status: number;
    details?: any;
};

export const useGetAllDataBarangays = (city?: { id: string; name: string }) => {
    const getAllDataBarangaysApiRequest = async (): Promise<ApiResponse<Barangay[]>> => {
        if (!city?.id) {
            return {
                success: true,
                data: [],
                pagination: {
                    totalCount: 0,
                    currentPage: 1,
                    pageSize: 10,
                    hasNextPage: false,
                    hasPrevPage: false,
                    totalPages: 1
                }
            };
        }

        try {
            const searchParams = new URLSearchParams({
                municipalityId: city.id,
                page: '1',
                limit: '100'
            });

            const response = await apiClient.get('attendance/barangays', {
                searchParams,
                // Override retry for this specific request if needed
                retry: {
                    limit: 5,
                    methods: ['get'],
                    statusCodes: [408, 413, 429, 500, 502, 503, 504],
                    backoffLimit: 5000,
                },
            }).json<ApiResponse<Barangay[]>>();

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch barangays');
            }

            return response;
        } catch (error: any) {
            if (error instanceof HTTPError) {
                const errorData = await error.response.json().catch(() => ({}));
                throw {
                    message: errorData.message || `HTTP ${error.response.status}: Failed to fetch barangays`,
                    status: error.response.status,
                    details: errorData
                } as ApiError;
            }

            if (error instanceof Error) {
                throw {
                    message: error.message || 'An unexpected error occurred',
                    status: 500
                } as ApiError;
            }

            throw {
                message: 'An unexpected error occurred',
                status: 500
            } as ApiError;
        }
    };

    const query = useQuery<ApiResponse<Barangay[]>, ApiError>({
        queryKey: ['barangays', city?.id],
        queryFn: getAllDataBarangaysApiRequest,
        enabled: !!city?.id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        // Remove retry from React Query since Ky handles it
        retry: false,
        refetchOnWindowFocus: false,
    });

    return {
        barangays: query.data?.data || [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isSuccess: query.isSuccess,
        refetch: query.refetch
    };
};