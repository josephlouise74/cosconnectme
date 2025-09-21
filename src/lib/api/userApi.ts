
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
import { BorrowerProfileResponse } from "../types/borrowerType";
import { SwitchRoleResponse, UpdatePersonalInfoResponse, UserPersonalInfoFormData, UserRolesResponse, UserRolesResponseData } from "../types/userType";
import { axiosApiClient } from "./axiosApiClient";
import { toast } from "sonner";
import { BusinessResponse, UserResponse } from "../types/profile/get-profile-data";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';


export const useGetUserRoles = (userId: string, enabled = true) => {
    const getUserRolesApiRequest = async (userId: string): Promise<UserRolesResponseData> => {
        if (!userId?.trim()) {
            throw new Error("User ID is required")
        }

        try {
            const { data } = await axiosApiClient.get<UserRolesResponse>(`user/roles/${userId}`)

            if (!data.success || !data.data) {
                throw new Error(data.message || "Failed to fetch user roles")
            }

            return data.data
        } catch (error) {
            console.log("error", error)
            const apiError = error as any
            const errorMessage = apiError.response?.data?.message || apiError.message || "Failed to fetch user roles"
            throw new Error(errorMessage)
        }
    }

    const query = useQuery<UserRolesResponseData, Error>({
        queryKey: ["userRoles", userId],
        queryFn: () => getUserRolesApiRequest(userId),
        enabled: enabled && !!userId?.trim(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    })

    return {
        data: query.data,
        error: query.error,
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
        refetch: query.refetch,
    }
}

/**
 * Custom hook to fetch user profile data by username
 * @param username - The username of the user profile to fetch
 * @returns Profile data, loading state, error state and refetch function
 */
export const useGetUserProfile = (username: string, user_id: string) => {
    const fetchUserProfile = async (): Promise<BorrowerProfileResponse> => {
        if (!username) {
            throw new Error("Username is required to fetch profile data");
        }

        try {
            const response = await axiosApiClient.get<BorrowerProfileResponse>(
                `/users`,
                {
                    params: {
                        username,
                        user_id
                    }
                }
            );

            if (response.data.status !== 'success') {
                throw new Error('Failed to fetch profile data');
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Failed to fetch profile data: ${message}`);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred while fetching profile data');
        }
    };

    const query = useQuery({
        queryKey: ['userProfile', username],
        queryFn: fetchUserProfile,
        enabled: Boolean(username),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
};


/**
 * Custom hook to update user personal information
 * Works for both borrower and lender roles
 * @returns Mutation object with update function and states
 */
export const useUpdatePersonalInfo = () => {
    const updatePersonalInfo = async ({
        userId,
        data,
        userRole,
    }: {
        userId: string
        data: UserPersonalInfoFormData
        userRole?: "borrower" | "lender"
    }): Promise<UpdatePersonalInfoResponse> => {
        if (!userId) {
            throw new Error("User ID is required to update personal information")
        }

        try {
            const endpoint = userRole
                ? `${API_BASE_URL}/users/${userId}/personal-info?role=${userRole}`
                : `${API_BASE_URL}/users/${userId}/personal-info`

            const response = await axios.patch<UpdatePersonalInfoResponse>(endpoint, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to update personal information")
            }

            return response.data
        } catch (error) {
            console.error("Update personal info error:", error)

            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message
                const code = error.response?.data?.code

                switch (code) {
                    case "USERNAME_ALREADY_EXISTS":
                        throw new Error("Username is already taken by another user")
                    case "EMAIL_ALREADY_EXISTS":
                        throw new Error("Email is already registered by another user")
                    case "BUSINESS_NAME_ALREADY_EXISTS":
                        throw new Error("Business name is already registered by another user")
                    case "USER_NOT_FOUND":
                        throw new Error("User not found")
                    case "INVALID_USER_ID_FORMAT":
                        throw new Error("Invalid user ID format")
                    case "MISSING_REQUIRED_FIELDS":
                        throw new Error(`Missing required fields: ${error.response?.data?.details?.missingFields?.join(", ")}`)
                    case "INVALID_ROLE":
                        throw new Error("Invalid user role specified")
                    default:
                        throw new Error(`Failed to update personal information: ${message}`)
                }
            }

            if (error instanceof Error) {
                throw error
            }
            throw new Error("Failed to update personal information")
        }
    }

    const mutation = useMutation({
        mutationFn: updatePersonalInfo,
        onError: (error) => {
            console.error("Failed to update personal information:", error)
        },
    })

    return {
        isPending: mutation.isPending,
        mutateAsync: mutation.mutateAsync,
        mutate: mutation.mutate,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
        reset: mutation.reset,
    }
}






export const useSwitchRole = () => {
    const queryClient = useQueryClient()

    const switchRoleApiRequest = async ({
        userId,
        targetRole,
    }: {
        userId: string
        targetRole: "borrower" | "lender"
    }): Promise<SwitchRoleResponse> => {
        try {
            if (!userId?.trim()) {
                throw new Error("User ID is required")
            }

            if (!targetRole || !["borrower", "lender"].includes(targetRole)) {
                throw new Error("Valid target role (borrower or lender) is required")
            }

            console.log(`Switching to ${targetRole} role for user ${userId}`)

            const response = await axiosApiClient.patch(`user/switch-role/${userId}?targetRole=${encodeURIComponent(targetRole)}`)
            console.log("Switch role response:", response.data)

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to switch role")
            }

            return response.data
        } catch (error: any) {
            console.error("Error in switchRoleApiRequest:", error)
            const errorMessage = error.response?.data?.message || error.message || "Failed to switch role"
            console.error("Error details:", {
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data
                }
            })
            throw new Error(errorMessage)
        }
    }

    const mutation = useMutation({
        mutationFn: switchRoleApiRequest,
        onSuccess: (data, variables) => {
            console.log("Role switch successful:", data)
            toast.success(data.message || "Role switched successfully!")
            // Invalidate relevant queries
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["userRoles", variables.userId] }),
                queryClient.invalidateQueries({ queryKey: ["userProfile"] })
            ]).catch(console.error)
        },
        onError: (error: Error) => {
            console.error("Mutation error:", error)
            toast.error(error.message || "Failed to switch role")
        },
    })

    return {
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
        data: mutation.data,
        mutateAsync: mutation.mutateAsync,
        reset: mutation.reset,
    }
}


// Union type for the combined response
export type UserDataResponse = BusinessResponse | UserResponse;

/**
 * Custom hook to fetch user profile data by user_id and role
 * @param user_id - The user ID to fetch data for
 * @param role - The role context ('borrower' or 'lender')
 * @returns Profile data, loading state, error state and refetch function
 */
export const useGetUserDataByIdWithRole = (user_id: string, role: 'borrower' | 'lender') => {
    const getUserDataByIdWithRole = async (): Promise<UserDataResponse> => {
        if (!user_id || !role) {
            throw new Error("Both user_id and role are required to fetch profile data");
        }
        console.log("Fetching profile data for user_id:", user_id, "and role:", role);
        try {
            const response = await axiosApiClient.get<UserDataResponse>(
                `/user/profile`,
                {
                    params: {
                        user_id,
                        role
                    }
                }
            );

            if (!response.data.success) {
                throw new Error('Failed to fetch profile data');
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Failed to fetch profile data: ${message}`);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred while fetching profile data');
        }
    };

    const query = useQuery({
        queryKey: ['userDataByIdWithRole', user_id, role],
        queryFn: getUserDataByIdWithRole,
        enabled: Boolean(user_id && role),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
};