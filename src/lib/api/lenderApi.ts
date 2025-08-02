import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LenderFormDataType, LenderV2ApiResponse } from "../types/lenderType"
import ky, { HTTPError } from "ky"
import { toast } from "sonner"

const API_BASE_URL = "http://localhost:8000/api/v2"




// Register Lender Account Hook
export const useRegisterLenderAccount = () => {
    const queryClient = useQueryClient()

    const registerLenderAccountApiRequest = async ({
        userId,
        lenderData
    }: {
        userId: string
        lenderData: LenderFormDataType
    }): Promise<LenderV2ApiResponse> => {
        try {
            console.log('Registering lender account:', { userId, lenderData })

            if (!userId) {
                throw new Error('User ID is required')
            }

            const response = await ky.post(`${API_BASE_URL}/lender/register/${userId}`, {
                json: lenderData,
                headers: {
                    'Content-Type': 'application/json',
                },
            }).json<LenderV2ApiResponse>()

            console.log('Register lender account response:', response)
            return response
        } catch (error) {
            console.error('Register lender account API error:', error)

            if (error instanceof HTTPError) {
                const errorResponse = await error.response.json().catch(() => ({}))
                const errorMessage = errorResponse?.message || 'Failed to register lender account'

                console.error('Register lender account error details:', {
                    status: error.response.status,
                    data: errorResponse,
                    message: errorMessage,
                    errors: errorResponse?.errors
                })

                // If there are validation errors, include them in the error message
                if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
                    const validationErrors = errorResponse.errors
                        .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
                        .join(', ')
                    throw new Error(`${errorMessage}. Validation errors: ${validationErrors}`)
                }

                throw new Error(errorMessage)
            }

            throw new Error('Network error occurred while registering lender account')
        }
    }

    const mutation = useMutation({
        mutationFn: registerLenderAccountApiRequest,
        onSuccess: (data, variables) => {
            console.log('Lender account registered successfully:', data)
            toast.success(data.message || 'Lender application submitted successfully!')

            // Invalidate relevant queries for real-time updates
            queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['lenderById'] })

        },
        onError: (error: Error) => {
            console.error('Register lender account mutation error:', error)
            toast.error(error.message || 'Failed to register lender account')
        },
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
    }
}