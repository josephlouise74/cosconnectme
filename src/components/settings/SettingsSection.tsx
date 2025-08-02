"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import SettingsContentSkeleton from './SettingsContentSkeleton'
import SettingsSidebarSkeleton from './SettingsSidebarSkeleton'
import { useSwitchRole } from '@/lib/api/authApi'

// Dynamic imports for heavy/rarely-used components
const RegisterSellerAccount = dynamic(() => import('./RegisterLenderAccount'))
const DeleteAccount = dynamic(() => import('./DeleteAccount'))
const PersonalInfo = dynamic(() => import('./PersonalInfo'))
const NavigationSidebar = dynamic(() => import('./NavigationSideBar'))

const SettingsSection = () => {
    const [activeTab, setActiveTab] = useState('personal')
    const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();
    const { isLoading: isSwitching, mutateAsync: switchRole } = useSwitchRole();
    const [switchError, setSwitchError] = useState<string | null>(null);

    // Memoize business info grid (move above any return)
    const businessInfoGrid = useMemo(() => (
        <div className="space-y-6">
            {/* Store Front image */}
            {userRolesData?.business_info?.upload_storefront_photo && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Store Front</h3>
                    <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
                        <Image
                            src={userRolesData.business_info.upload_storefront_photo}
                            alt="Store Front"
                            fill
                            className="object-cover"
                            sizes="(max-inline-size: 768px) 100vw, 400px"
                        />
                    </div>
                </div>
            )}
            {/* Business Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Details Card */}
                <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <h3 className="text-lg font-semibold">Business Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business Name</span>
                                <span className="text-base font-medium text-foreground">{userRolesData?.business_info?.business_name || 'Not provided'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business Type</span>
                                <span className="text-base font-medium text-foreground capitalize">{userRolesData?.business_info?.business_type || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business Phone Number</span>
                                <span className="text-base font-medium text-foreground">{userRolesData?.business_info?.business_phone_number || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </Card>
                {/* Location & Contact Card */}
                <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <h3 className="text-lg font-semibold">Location & Contact</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Region</span>
                                <span className="text-base font-medium text-foreground">{userRolesData?.business_info?.region || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business Address</span>
                                <span className="text-base font-medium text-foreground leading-relaxed">{userRolesData?.business_info?.business_address || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            {/* Business Description Card */}
            <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-semibold">About the Business</h3>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</span>
                        <p className="text-base text-foreground leading-relaxed">
                            {userRolesData?.business_info?.business_description || 'No description provided for this business.'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    ), [userRolesData]);

    // If not authenticated, show loading or redirect
    if (!isAuthenticated && !isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                    <p className="text-muted-foreground">Please sign in to access settings.</p>
                </div>
            </div>
        )
    }

    // Handler to switch roles based on current_role
    const getTargetRole = () => {
        if (!userRolesData?.current_role) return null;
        return userRolesData.current_role === 'lender' ? 'borrower' : 'lender';
    };
    const getTargetRoleLabel = () => {
        const target = getTargetRole();
        if (target === 'lender') return 'Switch to Lender';
        if (target === 'borrower') return 'Switch to Borrower';
        return 'Switch Role';
    };
    const handleSwitchRole = async () => {
        setSwitchError(null);
        const targetRole = getTargetRole();
        if (!userRolesData?.user_id || !targetRole) {
            setSwitchError('User ID or target role not found.');
            return;
        }
        try {
            await switchRole({ userId: userRolesData.user_id, targetRole });
            // Optionally, you may want to refresh user data or redirect here
        } catch (error: any) {
            setSwitchError(error.message || 'Failed to switch role.');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1">
                        {isLoading ? (
                            <SettingsSidebarSkeleton />
                        ) : (
                            <NavigationSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <SettingsContentSkeleton />
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsContent value="personal" className="mt-0">
                                    <PersonalInfo />
                                </TabsContent>

                                <TabsContent value="lender" className="mt-0">
                                    {userRolesData?.can_switch_roles ? (
                                        <div className="flex flex-col items-center justify-center ">
                                            <Card className="w-full mb-8 shadow-lg border ">
                                                <CardHeader className="bg-primary/5 rounded-t-lg">
                                                    <CardTitle className="text-xl font-semibold text-center">Your Lender Business Info</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4 py-6">
                                                    {/* Show current role for clarity */}
                                                    <div className="flex justify-end mb-2">
                                                        <span className="text-sm text-muted-foreground font-medium">Current Role: <span className="font-bold text-primary">{userRolesData.current_role?.charAt(0).toUpperCase() + userRolesData.current_role?.slice(1)}</span></span>
                                                    </div>
                                                    {businessInfoGrid}
                                                </CardContent>
                                            </Card>
                                            <Button
                                                className="px-8 py-3 rounded-lg  font-semibold shadow-lg hover:to-primary transition text-lg"
                                                onClick={handleSwitchRole}
                                                disabled={isSwitching}
                                            >
                                                {isSwitching ? 'Switching...' : getTargetRoleLabel()}
                                            </Button>
                                            {switchError && (
                                                <div className="text-red-500 mt-2 text-sm">{switchError}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <RegisterSellerAccount />
                                    )}
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
                                    <DeleteAccount />
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>
            <FullScreenLoader isVisible={isSwitching} message="Switching to Lender..." />
        </div>
    )
}

export default SettingsSection