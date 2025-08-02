
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";
import { ApiErrorResponse, ApiResponse, CostumeItem, PaginatedApiResponse, PaginationParams } from "../types/marketplaceType";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v2";

const apiClient = ky.create({
    prefixUrl: API_BASE_URL,
    timeout: 30000,
    retry: {
        limit: 3,
        methods: ['get', 'post'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
        beforeRequest: [
            (request) => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        ],
        afterResponse: [
            async (request, _, response) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`API Call: ${request.method} ${request.url} - ${response.status}`);
                }
                return response;
            }
        ]
    }
});

// ===============================
// QUERY KEYS FACTORY
// ===============================

export const costumeKeys = {
    all: ['costumes'] as const,
    lists: () => [...costumeKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...costumeKeys.lists(), { filters }] as const,
    details: () => [...costumeKeys.all, 'detail'] as const,
    detail: (id: string) => [...costumeKeys.details(), id] as const,
    byLender: (lenderId: string) => [...costumeKeys.all, 'byLender', lenderId] as const,
    byLenderPaginated: (lenderId: string, pagination: PaginationParams) =>
        [...costumeKeys.byLender(lenderId), 'paginated', pagination] as const,
    marketplace: (page: number, limit: number, filters?: Record<string, any>) =>
        [...costumeKeys.lists(), 'marketplace', page, limit, filters] as const,
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

const handleApiError = async (error: unknown): Promise<never> => {
    if (error instanceof HTTPError) {
        const errorData = await error.response.json().catch(() => ({})) as ApiErrorResponse;
        const errorMessage = errorData.message || `API Error: ${error.response.status}`;
        throw new Error(errorMessage);
    }

    if (error instanceof Error) {
        throw error;
    }

    throw new Error('An unexpected error occurred');
};

const validateUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

// ===============================
// API HOOKS
// ===============================

/**
 * Hook to fetch single costume details
 */
export const useGetCostumeById = (id: string, options?: { enabled?: boolean }) => {
    const getCostumeById = async (): Promise<CostumeItem | undefined> => {
        if (!id) {
            throw new Error('Costume ID is required');
        }

        try {
            const response = await apiClient.get(`costume/${id}`).json<ApiResponse<CostumeItem>>();

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Costume not found');
            }

            return response.data;
        } catch (error) {
            await handleApiError(error);
        }
    };

    return useQuery({
        queryKey: costumeKeys.detail(id),
        queryFn: getCostumeById,
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: (failureCount, error) => {
            if (error instanceof HTTPError && error.response.status >= 400 && error.response.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook to fetch all costumes created by a specific lender
 */
export const useGetAllCreatedCostumeByLenderId = (
    lenderId: string,
    options?: { enabled?: boolean }
) => {
    const getAllCreatedCostumeByLenderId = async (): Promise<CostumeItem[] | undefined> => {
        if (!lenderId) {
            throw new Error('Lender ID is required');
        }

        if (!validateUUID(lenderId)) {
            throw new Error('Invalid lender ID format');
        }

        try {
            const response = await apiClient.get(`costume/all/${lenderId}?limit=1000`).json<ApiResponse<CostumeItem[]>>();

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch costumes');
            }

            return response.data || [];
        } catch (error) {
            if (error instanceof HTTPError && error.response.status === 404) {
                return []; // Return empty array for 404 instead of throwing
            }
            await handleApiError(error);
        }
    };

    return useQuery({
        queryKey: costumeKeys.byLender(lenderId),
        queryFn: getAllCreatedCostumeByLenderId,
        enabled: Boolean(lenderId) && (options?.enabled !== false),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: (failureCount, error) => {
            if (error instanceof HTTPError && error.response.status >= 400 && error.response.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook to fetch all costumes for marketplace with pagination
 */
export const useGetAllCostumeForMarketPlace = (options?: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    enabled?: boolean;
}) => {
    const getAllCostumeForMarketPlace = async (): Promise<PaginatedApiResponse<CostumeItem[]> | undefined> => {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters
            if (options?.page) queryParams.append('page', options.page.toString());
            if (options?.limit) queryParams.append('limit', options.limit.toString());

            // Add filters
            if (options?.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const response = await apiClient.get(`costume/marketplace${queryString}`).json<PaginatedApiResponse<CostumeItem[]>>();

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch marketplace costumes');
            }

            return response;
        } catch (error) {
            if (error instanceof HTTPError && error.response.status === 404) {
                // Return empty data structure for 404
                return {
                    success: true,
                    data: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: options?.limit || 10,
                        hasNextPage: false,
                        hasPreviousPage: false
                    },
                    message: 'No costumes found'
                };
            }
            await handleApiError(error);
        }
    };

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    return useQuery({
        queryKey: costumeKeys.marketplace(page, limit, options?.filters),
        queryFn: getAllCostumeForMarketPlace,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: options?.enabled !== false,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error instanceof HTTPError && error.response.status >= 400 && error.response.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};

/**
 * Hook to create a new costume
 */
/* export const useCreateCostume = () => {
    const queryClient = useQueryClient();

    const createCostume = async (productData: CreateCostumeData): Promise<ApiResponse<CostumeItem>> => {
        try {
            const response = await apiClient.post('costume/create', {
                json: productData,
                headers: {
                    'Content-Type': 'application/json',
                },
            }).json<ApiResponse<CostumeItem>>();

            if (!response.success) {
                throw new Error(response.message || 'Failed to create costume');
            }

            return response;
        } catch (error) {
            if (error instanceof HTTPError) {
                const errorData = await error.response.json().catch(() => ({})) as ApiErrorResponse;
                const errorMessage = errorData.message || 'Failed to create costume';
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const mutation = useMutation({
        mutationFn: createCostume,
        onSuccess: (data, variables) => {
            // Get the lender ID from the product data
            const lenderId = variables.lenderUser?.uid;
            if (lenderId) {
                // Invalidate and refetch the costume list for this lender
                queryClient.invalidateQueries({
                    queryKey: costumeKeys.byLender(lenderId)
                });
                queryClient.invalidateQueries({
                    queryKey: costumeKeys.byLenderPaginated(lenderId, { page: 1, limit: 10 })
                });
            }

            // Invalidate all costumes queries to ensure consistency
            queryClient.invalidateQueries({
                queryKey: costumeKeys.all
            });

            // Invalidate marketplace queries
            queryClient.invalidateQueries({
                queryKey: [...costumeKeys.lists(), 'marketplace']
            });

            toast.success(data.message || 'Costume created successfully!');
        },
        onError: (error: Error) => {
            console.error('Costume creation failed:', error);
        },
    });

    return {
        createCostume: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
    };
};
 */


/**


* Hook to prefetch costume data - useful for hover effects or pagination
 */
export const usePrefetchCostume = () => {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: costumeKeys.detail(id),
            queryFn: async () => {
                const response = await apiClient.get(`costume/${id}`).json<ApiResponse<CostumeItem>>();
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Costume not found');
                }
                return response.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    };
}