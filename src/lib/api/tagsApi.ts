import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface TagsParams {
    page?: number;
    limit?: number;
}

interface Tag {
    id: string;
    tagName: string;
    createdAt: string;
    updatedAt: string;
    adminDetails: {
        adminId: string;
        adminName: string;
        adminEmail: string;
        adminRole: string;
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

interface GetAllTagsResponse {
    success: boolean;
    message?: string;
    data: {
        tags: Tag[];
        pagination: PaginationInfo;
    };
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const useGetAllTags = (params: TagsParams) => {
    const getAllTagsApiRequest = async (): Promise<GetAllTagsResponse> => {


        try {
            const response = await apiClient.get(`/products/get-all-tags`, {
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                },
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch tags');
            }

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ success: boolean; message: string }>;
            console.error('Tags fetch error:', {
                status: axiosError.response?.status,
                message: axiosError.response?.data?.message || axiosError.message,
                error: axiosError
            });

            const errorMessage =
                axiosError.response?.status === 400 ? 'Invalid request parameters' :
                    axiosError.response?.status === 401 ? 'Unauthorized access' :
                        axiosError.response?.status === 403 ? 'Access forbidden' :
                            axiosError.response?.data?.message || 'Failed to fetch tags';

            toast.error(errorMessage);
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['tags', params],
        queryFn: getAllTagsApiRequest,
        retry: 1,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return {
        tags: query.data?.data.tags || [],
        pagination: query.data?.data.pagination || {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 0,
            hasMore: false,
        },
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isSuccess: query.isSuccess,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
};
