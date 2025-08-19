// src/hooks/useGetAllCostumeForMarketPlace.ts

import { useQuery } from "@tanstack/react-query";

import { GetMarketplaceCostumesResponse } from "../types/marketplaceType";
import { ApiError, axiosApiClient } from "./axiosApiClient";
import { GetCostumeByNameResponse } from "../types/marketplace/get-costume";

export const useGetMarketCostumeById = (id: string, enabled: boolean = true) => {
    const getMarketCostumeById = async (): Promise<GetCostumeByNameResponse> => {
        try {
            console.log("Fetching costume by id:", encodeURIComponent(id));
            const response = await axiosApiClient.get<GetCostumeByNameResponse>(
                `marketplace/costume/${id}`
            );

            if (!response.data.success) {
                throw new Error(response.data?.data ? "Costume not found" : "Failed to fetch costume");
            }

            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;

            if (apiError.response?.status === 404) {
                return {
                    success: true,
                    data: {} as any, // empty placeholder
                };
            }

            throw new Error(
                apiError.response?.data?.message ||
                `Failed to fetch costume: ${apiError.response?.status || "Unknown error"}`
            );
        }
    };

    const query = useQuery({
        queryKey: ["marketplace", "costume", id],
        queryFn: getMarketCostumeById,
        enabled: enabled && !!id, // only run if id is provided and enabled
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    });

    return {
        isFetching: query.isFetching,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        costume: query.data?.data, // returns CostumeByName
        refetch: query.refetch,
        isSuccess: query.isSuccess,
    };
};


interface Options {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    enabled?: boolean;
}

export const useGetAllCostumeForMarketPlace = (options?: Options) => {
    const getAllCostumeForMarketPlaceApiRequest = async (): Promise<GetMarketplaceCostumesResponse> => {
        try {
            const queryParams = new URLSearchParams();

            if (options?.page) queryParams.append("page", options.page.toString());
            if (options?.limit) queryParams.append("limit", options.limit.toString());

            if (options?.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

            const response = await axiosApiClient.get<GetMarketplaceCostumesResponse>(
                `/marketplace/costumes${queryString}`
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch marketplace costumes");
            }

            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;

            if (apiError.response?.status === 404) {
                // Return empty structure matching GetMarketplaceCostumesResponse
                return {
                    success: true,
                    message: "No costumes found",
                    data: {
                        costumes: [],
                        pagination: {
                            page: options?.page || 1,
                            limit: options?.limit || 10,
                            total_count: 0,
                            total_pages: 0,
                            has_next_page: false,
                            has_previous_page: false,
                        },
                    },
                };
            }

            throw new Error(
                apiError.response?.data?.message ||
                `Failed to fetch marketplace costumes: ${apiError.response?.status || "Unknown error"}`
            );
        }
    };

    const query = useQuery({
        queryKey: [
            "marketplace",
            options?.page || 1,
            options?.limit || 10,
            options?.filters,
        ],
        queryFn: getAllCostumeForMarketPlaceApiRequest,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: options?.enabled !== false,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    });

    return {
        isFetching: query.isFetching,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        costumes: query.data?.data.costumes || [],
        pagination: query.data?.data.pagination,
        refetch: query.refetch,
        isSuccess: query.isSuccess,
    };
};


