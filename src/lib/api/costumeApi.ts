import type { CostumeFormValues } from '@/lib/zodSchema/costumeSchema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { axiosApiClient } from './axiosApiClient';

// API Response Types
interface ApiSuccessResponse {
    success: true;
    message: string;
    data: {
        id: string;
        name: string;
        category: string;
        listing_type: string;
        status: string;
        addOnsCount: number;
        created_at: string;
    };
    requestId: string;
    duration: string;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any[];
    code?: string;
    requestId: string;
    duration: string;
}

// Standalone API function for creating a costume
export const createCostumeApi = async (costumeData: CostumeFormValues): Promise<ApiSuccessResponse['data']> => {
    try {
        const response = await axiosApiClient.post(`/costume/create`, costumeData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Add auth token
            },
        });

        const responseData: ApiSuccessResponse | ApiErrorResponse = response.data;

        if (!responseData.success) {
            const errorResponse = responseData as ApiErrorResponse;
            throw new Error(errorResponse.message || 'Failed to create costume');
        }

        return responseData.data;
    } catch (error: any) {
        console.error('Costume creation error:', error);

        if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        toast.error('An unexpected error occurred');
        throw error;
    }
};

// React Query hook for costume creation
export const useCreateCostume = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createCostumeApi,

        onSuccess: (data) => {
            // Invalidate costume queries to refresh cache
            queryClient.invalidateQueries({ queryKey: ['costumes'] });

            toast.success('Costume created successfully!');
            return data;
        },

        onError: (error: Error) => {
            console.error('Costume creation failed:', error);
            // Error toast is already shown in createCostumeApi
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

// Updated types to match the backend schema
export interface CostumeAddOn {
    id: string;
    costume_id: string;
    name: string;
    description: string;
    price: string;
    image_url?: string;
    category?: string;
    is_included: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MainImages {
    front: string;
    back: string;
}

export interface AdditionalImage {
    url: string;
    alt_text?: string;
    order: number;
}

export interface Costume {
    id: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    gender: 'male' | 'female' | 'unisex';
    sizes: string;
    tags: string[];
    listing_type: 'rent' | 'sale' | 'both';
    rental_price: string;
    sale_price: string;
    security_deposit: string;
    discount_percentage: number;
    extended_days_price: string;
    main_images: MainImages;
    additional_images: AdditionalImage[];
    lender_uid: string;
    status: 'active' | 'inactive' | 'rented' | 'maintenance';
    is_available: boolean;
    view_count: number;
    favorite_count: number;
    created_at: string;
    updated_at: string;
    addOns?: CostumeAddOn[];
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ApiResponse {
    success: boolean;
    data: Costume[];
    pagination: Pagination;
    message?: string;
    error?: string;
}

export interface UseGetMyCostumesOptions {
    lender_id: string;
    page?: number;
    limit?: number;
}

export const useGetMyCostumes = ({
    lender_id,
    page = 1,
    limit = 10,
}: UseGetMyCostumesOptions) => {
    const getMyCostumes = async (): Promise<ApiResponse> => {
        try {
            console.log("Fetching costumes with params:", { page, limit, lender_id });

            const response = await axiosApiClient.get<ApiResponse>(
                `/costume/my-costumes/${lender_id}`,
                {
                    params: {
                        page,
                        limit,
                    },
                }
            );

            console.log("API Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching costumes:", error);

            // Handle different error scenarios
            if (error.response?.status === 404) {
                throw new Error("Lender not found");
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.error || "Invalid request parameters");
            } else if (error.response?.status === 500) {
                throw new Error("Server error occurred while fetching costumes");
            }

            throw new Error("Failed to fetch costumes");
        }
    };

    return useQuery<ApiResponse>({
        queryKey: ["costumes", "my-costumes", { lender_id, page, limit }],
        queryFn: getMyCostumes,
        enabled: !!lender_id && lender_id.trim() !== "",
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on 404 or 400 errors
            if (error instanceof Error &&
                (error.message.includes("not found") || error.message.includes("Invalid request"))) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

// Additional utility hook for getting costume statistics
export const useGetCostumeStats = (lender_id: string) => {
    return useQuery({
        queryKey: ["costumes", "stats", lender_id],
        queryFn: async () => {
            const response = await axiosApiClient.get(`/costume/stats/${lender_id}`);
            return response.data;
        },
        enabled: !!lender_id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};