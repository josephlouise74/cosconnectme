// store/settingsStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { getUserSession } from "actions/auth"

interface UserSession {
    user: {
        id: string
        user_metadata?: {
            username?: string
            name?: string
            full_name?: string
        }
    }
}

interface SettingsState {
    // State
    userSession: UserSession | null
    borrowerProfile: any | null
    activeTab: string
    isLoadingSession: boolean
    isLoadingProfile: boolean
    sessionError: string | null
    profileError: string | null

    // Actions
    setActiveTab: (tab: string) => void
    setUserSession: (session: UserSession | null) => void
    setBorrowerProfile: (profile: any | null) => void
    setSessionLoading: (loading: boolean) => void
    setProfileLoading: (loading: boolean) => void
    setSessionError: (error: string | null) => void
    setProfileError: (error: string | null) => void
    fetchUserSession: () => Promise<void>
    clearErrors: () => void
    reset: () => void
}

const useSettingsStore = create<SettingsState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                userSession: null,
                borrowerProfile: null,
                activeTab: 'personal',
                isLoadingSession: false,
                isLoadingProfile: false,
                sessionError: null,
                profileError: null,

                // Actions
                setActiveTab: (tab: string) => set({ activeTab: tab }),

                setUserSession: (session: UserSession | null) => set({ userSession: session }),

                setBorrowerProfile: (profile: any | null) =>
                    set({ borrowerProfile: profile }),

                setSessionLoading: (loading: boolean) => set({ isLoadingSession: loading }),

                setProfileLoading: (loading: boolean) => set({ isLoadingProfile: loading }),

                setSessionError: (error: string | null) => set({ sessionError: error }),

                setProfileError: (error: string | null) => set({ profileError: error }),

                fetchUserSession: async () => {
                    const { setUserSession, setSessionLoading, setSessionError } = get()

                    try {
                        setSessionLoading(true)
                        setSessionError(null)
                        const session = await getUserSession()
                        setUserSession(session)
                    } catch (error) {
                        console.error("Error fetching user session:", error)
                        setSessionError(error instanceof Error ? error.message : "Failed to load user session")
                    } finally {
                        setSessionLoading(false)
                    }
                },

                clearErrors: () => set({ sessionError: null, profileError: null }),

                reset: () => set({
                    userSession: null,
                    borrowerProfile: null,
                    activeTab: 'personal',
                    isLoadingSession: false,
                    isLoadingProfile: false,
                    sessionError: null,
                    profileError: null,
                }),
            }),
            {
                name: 'settings-store',
                partialize: (state) => ({
                    activeTab: state.activeTab,
                    // Don't persist sensitive user data
                }),
            }
        ),
        { name: 'settings-store' }
    )
)

// Simple selectors - no computed values to avoid infinite loops
export const useUserSession = () => useSettingsStore((state) => state.userSession)
export const useBorrowerProfile = () => useSettingsStore((state) => state.borrowerProfile)
export const useActiveTab = () => useSettingsStore((state) => state.activeTab)
export const useUserId = () => useSettingsStore((state) => state.userSession?.user?.id || null)

// Memoized selectors to prevent infinite loops
export const useLoadingStates = () => useSettingsStore((state) => ({
    isLoadingSession: state.isLoadingSession,
    isLoadingProfile: state.isLoadingProfile,
    isLoading: state.isLoadingSession || state.isLoadingProfile,
}))

export const useErrors = () => useSettingsStore((state) => ({
    sessionError: state.sessionError,
    profileError: state.profileError,
    hasError: !!(state.sessionError || state.profileError),
}))

// Username selector with proper memoization
export const useUsername = () => {
    const userSession = useUserSession()

    if (!userSession?.user) return null

    let username = userSession.user.user_metadata?.username;
    if (!username || typeof username !== 'string' || username.trim() === '') {
        // Try to get from email
        const email = (userSession.user as any).email;
        username = email ? email.split('@')[0] : undefined;
    }
    return username ? username.toLowerCase() : 'user';
}

export default useSettingsStore