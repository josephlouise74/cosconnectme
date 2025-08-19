import type { CostumeFormValues } from '@/lib/zodSchema/costumeSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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