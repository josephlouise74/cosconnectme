import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import useSettingsStore, { useActiveTab } from '@/lib/zustand/settingsStore'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { AlertCircle, Loader2 } from 'lucide-react'
import React, { useCallback } from 'react'
import LoadingBoundary from '../settings/LoadingBoundary'

// Lazy load components for better performance
const PersonalInfo = React.lazy(() => import('./PersonalInfo'))
const DeleteAccount = React.lazy(() => import('../settings/DeleteAccount'))
const RegisterSellerAccount = React.lazy(() => import('./RegisterLenderAccount'))

const SettingsContent = React.memo(() => {
    const activeTab = useActiveTab()
    const { setActiveTab } = useSettingsStore()

    // Use the correct auth hook
    const {
        isAuthenticated,
        user,
        userRolesData,
        isLoading: authLoading,
        rolesError
    } = useSupabaseAuth()

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab)
    }, [setActiveTab])

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading user information...</span>
            </div>
        )
    }

    // Show error if there's a roles error
    if (rolesError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Error loading user roles: {rolesError.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        )
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please log in to access your settings.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="w-full">
            {/* Optional: Display current user info */}
            {userRolesData && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Logged in as:
                        </span>
                        <span className="font-medium">
                            {userRolesData.personal_info?.full_name || userRolesData.username || user.email}
                        </span>
                        {userRolesData.current_role && (
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                {userRolesData.current_role}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsContent value="personal" className="mt-0">
                    <LoadingBoundary>
                        <PersonalInfo />
                    </LoadingBoundary>
                </TabsContent>

                <TabsContent value="seller" className="mt-0">
                    <LoadingBoundary>
                        <RegisterSellerAccount />
                    </LoadingBoundary>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">Security Settings</h3>
                        <p className="text-muted-foreground mt-2">
                            This feature is coming soon
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="delete" className="mt-0">
                    <LoadingBoundary>
                        <DeleteAccount />
                    </LoadingBoundary>
                </TabsContent>
            </Tabs>
        </div>
    )
})

SettingsContent.displayName = 'SettingsContent'

export default SettingsContent