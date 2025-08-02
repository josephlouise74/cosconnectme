
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { CategoryResponse } from '../types/categoryType';

// Define base URL for API requests
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface CategoryParams {

    page?: number;
    limit?: number;
}


export const useFetchAllCategories = (params?: CategoryParams) => {
    const fetchAllCategories = async (): Promise<CategoryResponse> => {
        try {
            const response = await apiClient.get(`/products/get-all-categories`, {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                },
            });

            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('Category fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch categories. Please try again`.'
            );
            throw error;
        }
    };

    return useQuery({
        queryKey: ['categories', params],
        queryFn: fetchAllCategories,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        enabled: !!params?.page && !!params?.limit,
    });
};