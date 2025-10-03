"use client"

import { createClient } from "@/utils/supabase/client"
import { useCallback, useEffect, useState } from "react"

import type { UserRole } from "@/lib/types/userType"
import type { User } from "@supabase/supabase-js"
import { signOut } from "actions/auth"
import { useGetUserRoles } from "../api/userApi"

interface AuthState {
    isAuthenticated: boolean
    currentRole: UserRole | null
    user: User | null
    isLoading: boolean
}

export const useSupabaseAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        currentRole: null,
        user: null,
        isLoading: true,
    })

    const [shouldFetchRoles, setShouldFetchRoles] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const maxRetries = 3

    const updateAuthState = useCallback((updates: Partial<AuthState>) => {
        setAuthState((prev) => ({
            ...prev,
            ...updates,
            isLoading: updates.isLoading ?? prev.isLoading,
        }))
    }, [])

    const {
        data: userRolesData,
        isLoading: isRolesLoading,
        error: rolesError,
        refetch: refetchUserRoles,
    } = useGetUserRoles(
        authState.user?.id || "",
        shouldFetchRoles && authState.isAuthenticated && !!authState.user?.id
    )

    // Handle roles error with retry logic
    useEffect(() => {
        // Retry after a delay
        const retryTimer = setTimeout(() => {
            console.log(`Retrying user roles fetch (attempt ${retryCount + 1}/${maxRetries})`)
            setRetryCount(prev => prev + 1)
            refetchUserRoles()
        }, 2000 * (retryCount + 1)) // Exponential backoff: 2s, 4s, 6s

        if (rolesError && authState.isAuthenticated && retryCount < maxRetries) {
            console.error("Error fetching user roles:", rolesError)


            return () => clearTimeout(retryTimer)
        }

        // If we've exhausted retries, fall back to metadata
        if (rolesError && retryCount >= maxRetries) {
            console.warn("Max retries reached for user roles, falling back to metadata")
            if (authState.user?.user_metadata?.role) {
                updateAuthState({
                    currentRole: authState.user.user_metadata.role as UserRole,
                })
            }
        }
        return () => {
            clearTimeout(retryTimer)
        }
    }, [rolesError, authState.isAuthenticated, authState.user?.user_metadata?.role, updateAuthState, retryCount, refetchUserRoles])

    // Handle initial session and auth state changes
    useEffect(() => {
        const supabase = createClient()
        let mounted = true

        const handleAuthChange = async (event: string, session: any) => {
            if (!mounted) return

            const user = session?.user || null
            const isAuthenticated = !!user

            console.log("Auth state change:", event, { isAuthenticated, userId: user?.id })

            // Update auth state immediately
            updateAuthState({
                isAuthenticated,
                user,
                isLoading: false,
                currentRole: null, // Will be set by the roles data
            })

            // Reset retry count on auth change
            setRetryCount(0)

            // Enable role fetching after authentication
            if (isAuthenticated && user) {
                // Small delay to ensure user is fully set up in the database
                setTimeout(() => {
                    setShouldFetchRoles(true)
                }, 500)
            } else {
                setShouldFetchRoles(false)
            }
        }

        // Check initial session
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession()

                if (error) throw error

                if (session?.user) {
                    console.log("Initial session found:", session.user.id)
                    updateAuthState({
                        isAuthenticated: true,
                        user: session.user,
                        isLoading: false,
                    })
                    // Enable role fetching
                    setTimeout(() => {
                        setShouldFetchRoles(true)
                    }, 500)
                } else {
                    console.log("No initial session")
                    updateAuthState({
                        isAuthenticated: false,
                        user: null,
                        currentRole: null,
                        isLoading: false,
                    })
                    setShouldFetchRoles(false)
                }
            } catch (error) {
                console.error("Error in getInitialSession:", error)
                updateAuthState({
                    isAuthenticated: false,
                    user: null,
                    currentRole: null,
                    isLoading: false,
                })
                setShouldFetchRoles(false)
            }
        }

        // Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(handleAuthChange)

        // Get initial session
        getInitialSession()

        return () => {
            mounted = false
            subscription?.unsubscribe()
        }
    }, [updateAuthState])

    // Update role when user roles data is loaded
    useEffect(() => {
        if (userRolesData && authState.isAuthenticated) {
            console.log("[useSupabaseAuth] userRolesData received:", userRolesData)
            console.log("[useSupabaseAuth] current_role from API:", userRolesData.current_role)

            // Extract role with multiple fallbacks
            let extractedRole: UserRole | null = null

            if (userRolesData.current_role) {
                extractedRole = userRolesData.current_role
            } else if (userRolesData.roles && userRolesData.roles.length > 0) {
                extractedRole = userRolesData.roles[0] || null
            } else if (authState.user?.user_metadata?.role) {
                extractedRole = authState.user.user_metadata.role as UserRole
            }

            console.log("[useSupabaseAuth] extracted role:", extractedRole)

            // Only update if we have a valid role and it's different from current
            if (extractedRole && extractedRole !== authState.currentRole) {
                setAuthState((prev) => ({
                    ...prev,
                    currentRole: extractedRole,
                }))
                // Reset retry count on successful role fetch
                setRetryCount(0)
            }
        }
    }, [userRolesData, authState.isAuthenticated, authState.user?.user_metadata?.role, authState.currentRole])

    // Manual retry function
    const retryFetchRoles = useCallback(() => {
        setRetryCount(0)
        setShouldFetchRoles(false)
        setTimeout(() => {
            setShouldFetchRoles(true)
        }, 100)
    }, [])

    const isLoading = authState.isLoading || (authState.isAuthenticated && shouldFetchRoles && isRolesLoading)

    return {
        // Core auth state
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        currentRole: authState.currentRole,
        isLoading,

        userData: userRolesData || null,
        userDataError: rolesError || null,

        // User roles data (keeping for backward compatibility)
        userRolesData: userRolesData || null,
        rolesError: rolesError || null,
        refetchUserRoles,

        // New retry functionality
        retryFetchRoles,
        retryCount,
        maxRetries,

        // Auth actions
        signOut,
    }
}