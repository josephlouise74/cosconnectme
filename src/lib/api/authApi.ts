
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky, { HTTPError } from "ky"
import { toast } from "sonner"
import { SwitchRoleData, SwitchRoleResponse, UserRolesData } from "../types/authType"

const API_BASE_URL = "http://localhost:8000/api/v2"





// Switch Role Hook
export const useSwitchRole = () => {
    const queryClient = useQueryClient()
    const switchRoleApiRequest = async ({
        userId,
        targetRole
    }: {
        userId: string
        targetRole: string
    }): Promise<SwitchRoleResponse<SwitchRoleData>> => {
        try {
            console.log('Switching role:', { userId, targetRole })

            const response = await ky.post(`${API_BASE_URL}/lender/switch-role/${userId}`, {
                json: { targetRole },
                headers: {
                    'Content-Type': 'application/json',
                },
            }).json<SwitchRoleResponse<SwitchRoleData>>()

            console.log('Switch role response:', response)
            return response
        } catch (error) {
            console.error('Switch role API error:', error)

            if (error instanceof HTTPError) {
                const errorResponse = await error.response.json().catch(() => ({}))
                const errorMessage = errorResponse?.message || 'Failed to switch role'
                console.error('Switch role error details:', {
                    status: error.response.status,
                    data: errorResponse,
                    message: errorMessage
                })
                throw new Error(errorMessage)
            }

            throw new Error('Network error occurred while switching role')
        }
    }

    const mutation = useMutation({
        mutationFn: switchRoleApiRequest,
        onSuccess: (data, variables) => {
            console.log('Role switched successfully:', data)
            toast.success(data.message || 'Role switched successfully!')
            queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId] })
        },
        onError: (error: Error) => {
            console.error('Switch role mutation error:', error)
            toast.error(error.message || 'Failed to switch role')
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

// Get User Roles Hook
export const useGetUserRoles = (userId: string, enabled: boolean = true) => {
    const getUserRolesApiRequest = async (userId: string): Promise<SwitchRoleResponse<UserRolesData>> => {
        try {
            console.log('Fetching user roles for userId:', userId)

            if (!userId) {
                throw new Error('User ID is required')
            }

            const response = await ky.get(`${API_BASE_URL}/lender/roles/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                retry: {
                    limit: 3,
                    methods: ['get'],
                    statusCodes: [408, 413, 429, 500, 502, 503, 504],
                    backoffLimit: 30000,
                },
                timeout: 10000,
            }).json<SwitchRoleResponse<UserRolesData>>()

            console.log('Get user roles response:', response)
            return response
        } catch (error) {
            console.error('Get user roles API error:', error)

            if (error instanceof HTTPError) {
                const errorResponse = await error.response.json().catch(() => ({}))
                const errorMessage = errorResponse?.message || 'Failed to fetch user roles'
                console.error('Get user roles error details:', {
                    status: error.response.status,
                    data: errorResponse,
                    message: errorMessage
                })
                throw new Error(errorMessage)
            }

            throw new Error('Network error occurred while fetching user roles')
        }
    }

    const query = useQuery({
        queryKey: ['userRoles', userId],
        queryFn: () => getUserRolesApiRequest(userId),
        enabled: enabled && !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            console.log('Retry attempt:', failureCount, 'Error:', error)
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        data: query.data?.data, // Extract the data from the API response
        refetch: query.refetch,
        isFetching: query.isFetching,
    }
}