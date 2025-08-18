// hooks/useGetAllDataBarangays.ts

import { useQuery } from "@tanstack/react-query"
import ky, { HTTPError } from "ky"
import type { Barangay } from "../types/philippineDataType"

const API_BASE_URL = "https://tupv-dormitory-server-4pgk.onrender.com/api/v1"

const CACHE_KEY_PREFIX = "barangays_cache_"
const CACHE_EXPIRY_KEY_PREFIX = "barangays_expiry_"
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

const getCachedData = (cityId: string): ApiResponse<Barangay[]> | null => {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${cityId}`
        const expiryKey = `${CACHE_EXPIRY_KEY_PREFIX}${cityId}`

        const cachedData = localStorage.getItem(cacheKey)
        const expiry = localStorage.getItem(expiryKey)

        if (cachedData && expiry) {
            const expiryTime = Number.parseInt(expiry, 10)
            if (Date.now() < expiryTime) {
                return JSON.parse(cachedData)
            } else {
                // Clean up expired cache
                localStorage.removeItem(cacheKey)
                localStorage.removeItem(expiryKey)
            }
        }
    } catch (error) {
        console.warn("Failed to read from localStorage cache:", error)
    }
    return null
}

const setCachedData = (cityId: string, data: ApiResponse<Barangay[]>) => {
    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${cityId}`
        const expiryKey = `${CACHE_EXPIRY_KEY_PREFIX}${cityId}`
        const expiryTime = Date.now() + CACHE_DURATION

        localStorage.setItem(cacheKey, JSON.stringify(data))
        localStorage.setItem(expiryKey, expiryTime.toString())
    } catch (error) {
        console.warn("Failed to write to localStorage cache:", error)
    }
}

export const clearBarangayCache = (cityId?: string) => {
    if (cityId) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${cityId}`)
        localStorage.removeItem(`${CACHE_EXPIRY_KEY_PREFIX}${cityId}`)
    } else {
        // Clear all barangay caches
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(CACHE_EXPIRY_KEY_PREFIX)) {
                localStorage.removeItem(key)
            }
        })
    }
}

// Create a Ky instance with default configurations
const apiClient = ky.create({
    prefixUrl: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    retry: {
        limit: 3,
        methods: ["get"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        backoffLimit: 3000,
    },
    hooks: {
        beforeRetry: [
            ({ request, retryCount }) => {
                console.log(`Retrying request to ${request.url} (attempt ${retryCount + 1})`)
            },
        ],
    },
})

export type PaginationData = {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export type ApiResponse<T> = {
    success: boolean
    data: T
    pagination: PaginationData
    message?: string
}

export type ApiError = {
    message: string
    status: number
    details?: any
}

export const useGetAllDataBarangays = (city?: { id: string; name: string }) => {
    const getAllDataBarangaysApiRequest = async (): Promise<ApiResponse<Barangay[]>> => {
        if (!city?.id) {
            return {
                success: true,
                data: [],
                pagination: {
                    totalCount: 0,
                    currentPage: 1,
                    pageSize: 10,
                    hasNextPage: false,
                    hasPrevPage: false,
                    totalPages: 1,
                },
            }
        }

        const cachedData = getCachedData(city.id)
        if (cachedData) {
            console.log(`[v0] Using cached barangay data for city ${city.id}`)
            return cachedData
        }

        try {
            const searchParams = new URLSearchParams({
                municipalityId: city.id,
                page: "1",
                limit: "100",
            })

            const response = await apiClient
                .get("attendance/barangays", {
                    searchParams,
                    retry: {
                        limit: 5,
                        methods: ["get"],
                        statusCodes: [408, 413, 429, 500, 502, 503, 504],
                        backoffLimit: 5000,
                    },
                })
                .json<ApiResponse<Barangay[]>>()

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch barangays")
            }

            setCachedData(city.id, response)
            console.log(`[v0] Cached barangay data for city ${city.id}`)

            return response
        } catch (error: any) {
            if (error instanceof HTTPError) {
                const errorData = await error.response.json().catch(() => ({}))
                throw {
                    message: errorData.message || `HTTP ${error.response.status}: Failed to fetch barangays`,
                    status: error.response.status,
                    details: errorData,
                } as ApiError
            }

            if (error instanceof Error) {
                throw {
                    message: error.message || "An unexpected error occurred",
                    status: 500,
                } as ApiError
            }

            throw {
                message: "An unexpected error occurred",
                status: 500,
            } as ApiError
        }
    }

    const query = useQuery<ApiResponse<Barangay[]>, ApiError>({
        queryKey: ["barangays", city?.id],
        queryFn: getAllDataBarangaysApiRequest,
        enabled: !!city?.id,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    return {
        barangays: query.data?.data || [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isSuccess: query.isSuccess,
        refetch: query.refetch,
        clearCache: () => clearBarangayCache(city?.id),
    }
}
