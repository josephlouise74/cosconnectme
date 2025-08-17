"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FullScreenLoader } from "@/components/ui/full-screen-loader"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { useSwitchRole } from "@/lib/api/userApi"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import type { UserRolesResponseData } from "@/lib/types/userType"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useState } from "react"

// Skeleton components
import SettingsContentSkeleton from "./SettingsContentSkeleton"
import SettingsSidebarSkeleton from "./SettingsSidebarSkeleton"

// Dynamic imports for heavy/rarely-used components
const RegisterSellerAccount = dynamic(() => import("./RegisterLenderAccount"))
const DeleteAccount = dynamic(() => import("./DeleteAccount"))
const PersonalInfo = dynamic(() => import("./PersonalInfo"))
const NavigationSidebar = dynamic(() => import("./NavigationSideBar"))

interface BusinessInfoGridProps {
    userData: UserRolesResponseData
}

const BusinessInfoGrid: React.FC<BusinessInfoGridProps> = ({ userData }) => {
    const businessInfo = userData.business_info

    if (!businessInfo) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No business information available</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Store Front Image */}
            {businessInfo.documents?.upload_storefront_photo && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Store Front
                    </h3>
                    <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
                        <Image
                            src={businessInfo.documents.upload_storefront_photo}
                            alt="Store Front"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
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
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <h3 className="text-lg font-semibold">Business Details</h3>
                        </div>
                        <div className="space-y-3">
                            <InfoField
                                label="Business Name"
                                value={businessInfo.business_name as string || ""}
                            />
                            <InfoField
                                label="Business Type"
                                value={businessInfo.business_type as string || ""}
                                capitalize
                            />
                            <InfoField
                                label="Business Phone Number"
                                value={businessInfo.business_phone_number as string || ""}
                            />
                        </div>
                    </div>
                </Card>

                {/* Location & Contact Card */}
                <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <h3 className="text-lg font-semibold">Location & Contact</h3>
                        </div>
                        <div className="space-y-3">
                            <InfoField
                                label="Region"
                                value={businessInfo.business_address?.region as string || ""}
                            />
                            <InfoField
                                label="Business Address"
                                value={businessInfo.business_address as string || ""}
                                multiline
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Business Description Card */}
            <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <h3 className="text-lg font-semibold">About the Business</h3>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Description
                        </span>
                        <p className="text-base text-foreground leading-relaxed">
                            {businessInfo.business_description || "No description provided for this business."}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

interface InfoFieldProps {
    label: string
    value?: string | null
    capitalize?: boolean
    multiline?: boolean
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, capitalize, multiline }) => (
    <div>
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
        </span>
        <span className={`text-base font-medium text-foreground ${capitalize ? 'capitalize' : ''} ${multiline ? 'leading-relaxed' : ''}`}>
            {value || "Not provided"}
        </span>
    </div>
)

interface RoleSwitchSectionProps {
    userData: UserRolesResponseData
    currentRole: string
    onSwitchRole: () => void
    isSwitching: boolean
    switchError: string | null
}

const RoleSwitchSection: React.FC<RoleSwitchSectionProps> = ({
    userData,
    currentRole,
    onSwitchRole,
    isSwitching,
    switchError
}) => {
    const getTargetRoleLabel = () => {
        return currentRole === "lender" ? "Switch to Borrower" : "Switch to Lender"
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <Card className="w-full mb-8 shadow-lg border">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-center">
                        Your Lender Business Info
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-6">
                    <div className="flex justify-end mb-2">
                        <span className="text-sm text-muted-foreground font-medium">
                            Current Role:{" "}
                            <span className="font-bold text-primary capitalize">
                                {currentRole}
                            </span>
                        </span>
                    </div>
                    <BusinessInfoGrid userData={userData} />
                </CardContent>
            </Card>

            <Button
                className="px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow text-lg"
                onClick={onSwitchRole}
                disabled={isSwitching}
            >
                {isSwitching ? "Switching..." : getTargetRoleLabel()}
            </Button>

            {switchError && (
                <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>{switchError}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}

const SettingsSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState("personal")
    const { isAuthenticated, userData, isLoading, currentRole } = useSupabaseAuth()
    const { isLoading: isSwitching, mutateAsync: switchRole } = useSwitchRole()
    const [switchError, setSwitchError] = useState<string | null>(null)

    const handleSwitchRole = async () => {
        if (!userData?.user_id || !currentRole) {
            setSwitchError("User ID or current role not found.")
            return
        }

        setSwitchError(null)
        const targetRole = currentRole === "lender" ? "borrower" : "lender"

        try {
            await switchRole({ userId: userData.user_id, targetRole })
        } catch (error: any) {
            setSwitchError(error?.message || "Failed to switch role.")
        }
    }

    // Show authentication required screen
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

    const isLender = userData?.roles?.includes("lender")
    const hasBusinessInfo = userData?.business_info && Object.keys(userData.business_info).length > 0

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
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
                            <NavigationSidebar
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <SettingsContentSkeleton />
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                {/* Personal Information Tab */}
                                <TabsContent value="personal" className="mt-0">
                                    <PersonalInfo />
                                </TabsContent>

                                {/* Lender Tab */}
                                <TabsContent value="lender" className="mt-0">
                                    {isLender && hasBusinessInfo ? (
                                        <RoleSwitchSection
                                            userData={userData}
                                            currentRole={currentRole || "borrower"}
                                            onSwitchRole={handleSwitchRole}
                                            isSwitching={isSwitching}
                                            switchError={switchError}
                                        />
                                    ) : (
                                        <RegisterSellerAccount />
                                    )}
                                </TabsContent>

                                {/* Security Tab */}
                                <TabsContent value="security" className="mt-0">
                                    <div className="text-center py-12">
                                        <h3 className="text-lg font-medium">Security Settings</h3>
                                        <p className="text-muted-foreground mt-2">
                                            This feature is coming soon
                                        </p>
                                    </div>
                                </TabsContent>

                                {/* Delete Account Tab */}
                                <TabsContent value="delete" className="mt-0">
                                    <DeleteAccount />
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Screen Loader */}
            <FullScreenLoader
                isVisible={isSwitching}
                message="Switching roles..."
            />
        </div>
    )
}

export default SettingsSection