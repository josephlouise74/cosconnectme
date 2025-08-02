
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios from 'axios';
import { BorrowerPersonalInfoFormDataType, BorrowerProfileResponse } from "../types/borrowerType";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v2';

/**
 * Custom hook to fetch borrower profile data using URL parameter
 * @param username - The username of the borrower profile to fetch
 * @returns Profile data, loading state, error state and refetch function
 */
export const useGetBorrowerProfile = (username: string) => {
    const fetchProfileData = async (): Promise<BorrowerProfileResponse> => {
        if (!username) {
            throw new Error("Username is required to fetch profile data");
        }

        try {
            const response = await axios.get<BorrowerProfileResponse>(`${API_BASE_URL}/borrower/profile/${username}`);

            if (response.data.status !== 'success') {
                throw new Error('Failed to fetch profile data');
            }

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred while fetching profile data');
        }
    };

    const query = useQuery<BorrowerProfileResponse, Error, BorrowerProfileResponse['data']['user']>({
        queryKey: ['borrowerProfile', username],
        queryFn: fetchProfileData,
        enabled: Boolean(username),

        select: (data) => data.data.user // Transform the response to return just the user data
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch
    };
};

export const useUpdateInfoBorrower = (username: string) => {
    const queryClient = useQueryClient();

    const updateInfoBorrowerApiRequest = async ({
        id,
        data
    }: {
        id: string;
        data: BorrowerPersonalInfoFormDataType;
    }): Promise<BorrowerProfileResponse> => {
        try {
            const response = await axios.patch<BorrowerProfileResponse>(`${API_BASE_URL}/borrower/profile/${id}/update`, data);

            if (response.data.status !== 'success') {
                throw new Error('Failed to update borrower info');
            }

            return response.data;
        } catch (error) {
            console.log("error", error)
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update borrower info");
        }
    };

    const mutation = useMutation({
        mutationFn: updateInfoBorrowerApiRequest,
        onSuccess: (data) => {
            // Update the cache with the new data using the query key
            // Since useGetBorrowerProfile uses select to return data.data.user,
            // we need to update the cache with the transformed data
            queryClient.setQueryData(['borrowerProfile', username], data);
        },
    });

    return {
        isPending: mutation.isPending,
        mutateAsync: mutation.mutateAsync,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error
    };
};
