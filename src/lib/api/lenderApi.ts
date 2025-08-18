import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import type { LenderFormDataType, LenderV2ApiResponse } from "../types/lenderType"
import { axiosApiClient } from "./axiosApiClient"

export const useRegisterLenderAccount = () => {
    const queryClient = useQueryClient()

    const registerLenderAccountApiRequest = async ({
        userId,
        lenderData,
    }: {
        userId: string
        lenderData: LenderFormDataType
    }): Promise<LenderV2ApiResponse> => {
        try {
            console.log("[v0] Registering lender account:", { userId, lenderData })

            if (!userId) {
                throw new Error("User ID is required")
            }

            if (!lenderData) {
                throw new Error("Lender data is required")
            }

            const response = await axiosApiClient.post<LenderV2ApiResponse>(
                `/lender/register/${userId}`,
                lenderData,
                {
                    timeout: 30000, // 30 seconds timeout
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            console.log("[v0] Register lender account response:", response.data)

            if (!response.data.success) {
                throw new Error(response.data.message || "Registration failed")
            }

            return response.data
        } catch (error) {
            console.error("[v0] Register lender account API error:", error)

            if (error instanceof AxiosError) {
                const errorResponse = error.response?.data || {
                    success: false,
                    message: error.message || "Failed to process request",
                    statusCode: error.response?.status,
                };

                console.error("[v0] Register lender account error details:", {
                    status: error.response?.status,
                    data: errorResponse,
                    message: errorResponse.message,
                    errors: errorResponse.errors,
                });

                if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
                    const validationErrors = errorResponse.errors
                        .map((err: any) => `${err.path}: ${err.message}`)
                        .join(", ");
                    throw new Error(
                        `${errorResponse.message || 'Validation failed'}. ${validationErrors}`
                    );
                }

                switch (error.response?.status) {
                    case 400:
                        throw new Error(errorResponse.message || "Invalid request data");
                    case 401:
                        throw new Error("Authentication required");
                    case 403:
                        throw new Error("Access denied");
                    case 409:
                        throw new Error(errorResponse.message || "Lender account already exists");
                    case 422:
                        throw new Error(errorResponse.message || "Validation failed");
                    case 500:
                        throw new Error("Server error occurred. Please try again later.");
                    default:
                        throw new Error(errorResponse.message || "Failed to register lender account");
                }
            }

            if (error instanceof Error) {
                if (error.name === 'AxiosError' && error.message.includes('timeout')) {
                    throw new Error("Request timed out. Please check your connection and try again.");
                }
                throw error;
            }

            throw new Error("Network error occurred while registering lender account")
        }
    }

    const mutation = useMutation({
        mutationFn: registerLenderAccountApiRequest,
        onSuccess: (data, variables) => {
            console.log("[v0] Lender account registered successfully:", data)
            toast.success(data.message || "Lender application submitted successfully!")

            queryClient.invalidateQueries({
                queryKey: ["userRoles", variables.userId],
            })
            queryClient.invalidateQueries({
                queryKey: ["lenderById", data.data?.user_id],
            })
            queryClient.invalidateQueries({
                queryKey: ["lenderApplications"],
            })
        },
        onError: (error: Error) => {
            console.error("[v0] Register lender account mutation error:", error)
            toast.error(error.message || "Failed to register lender account")
        },
        retry: (failureCount, error) => {
            if (error.message.includes("Network error") && failureCount < 2) {
                return true
            }
            return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    return {
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        mutateAsync: mutation.mutateAsync,
        mutate: mutation.mutate,
        reset: mutation.reset,
        isIdle: mutation.isIdle,
        variables: mutation.variables,
    }
}
