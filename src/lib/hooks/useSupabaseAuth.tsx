"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import type { User } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types/userType"
import { useGetUserRoles } from "../api/userApi"
import { signOut } from "actions/auth"

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

    const router = useRouter()

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
    } = useGetUserRoles(authState.user?.id || "", authState.isAuthenticated && !!authState.user?.id)

    useEffect(() => {
        if (rolesError) {
            console.error("Error fetching user roles:", rolesError)
            // Use metadata as fallback if available
            if (authState.user?.user_metadata?.role) {
                updateAuthState({
                    currentRole: authState.user.user_metadata.role as UserRole,
                })
            }
        }
    }, [rolesError, authState.user?.user_metadata?.role, updateAuthState])

    // Handle initial session and auth state changes
    useEffect(() => {
        const supabase = createClient()
        let mounted = true

        const handleAuthChange = async (event: string, session: any) => {
            if (!mounted) return

            const user = session?.user || null
            const isAuthenticated = !!user

            // Update auth state immediately
            updateAuthState({
                isAuthenticated,
                user,
                isLoading: false,
                currentRole: null, // Will be set by the roles data
            })
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
                    updateAuthState({
                        isAuthenticated: true,
                        user: session.user,
                        isLoading: false,
                    })
                } else {
                    updateAuthState({
                        isAuthenticated: false,
                        user: null,
                        currentRole: null,
                        isLoading: false,
                    })
                }
            } catch (error) {
                console.error("Error in getInitialSession:", error)
                updateAuthState({
                    isAuthenticated: false,
                    user: null,
                    currentRole: null,
                    isLoading: false,
                })
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
            console.log("[v0] userRolesData received:", userRolesData)
            console.log("[v0] current_role from API:", userRolesData.current_role)

            // Extract role with multiple fallbacks
            let extractedRole: UserRole | null = null

            if (userRolesData.current_role) {
                extractedRole = userRolesData.current_role
            } else if (userRolesData.roles && userRolesData.roles.length > 0) {
                extractedRole = userRolesData.roles[0] || null
            } else if (authState.user?.user_metadata?.role) {
                extractedRole = authState.user.user_metadata.role as UserRole
            }

            console.log("[v0] extracted role:", extractedRole)

            // Only update if we have a valid role and it's different from current
            if (extractedRole && extractedRole !== authState.currentRole) {
                setAuthState((prev) => ({
                    ...prev,
                    currentRole: extractedRole,
                }))
            }
        }
    }, [userRolesData, authState.isAuthenticated, authState.user?.user_metadata?.role, authState.currentRole])

    const isLoading = authState.isLoading || (authState.isAuthenticated && isRolesLoading)

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

        // Auth actions
        signOut,
    }
}
