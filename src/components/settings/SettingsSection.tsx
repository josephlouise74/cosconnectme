"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FullScreenLoader } from "@/components/ui/full-screen-loader"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Award, Building, Calendar, Camera, CheckCircle, FileText, Mail, MapPin, Phone, XCircle } from "lucide-react"

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
    userData: any
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

    // Helper function to check if document exists
    const hasDocument = (url?: string | null): boolean => {
        return Boolean(url && url.trim() !== "")
    }

    // Helper function to format date
    const formatDate = (dateString?: string | null): string | null => {
        if (!dateString) return null
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Verification Status Banner */}
            <div className="mb-6">
                <div
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${businessInfo.is_verified
                        ? "bg-green-50 border-green-200 text-green-800 shadow-green-100/50 shadow-lg"
                        : businessInfo.rejection_reason
                            ? "bg-red-50 border-red-200 text-red-800 shadow-red-100/50 shadow-lg"
                            : "bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100/50 shadow-lg"
                        }`}
                >
                    {businessInfo.is_verified ? (
                        <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    ) : businessInfo.rejection_reason ? (
                        <XCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    ) : (
                        <div className="w-5 h-5 mt-1 flex-shrink-0 rounded-full border-2 border-current animate-pulse" />
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-lg">
                            {businessInfo.is_verified
                                ? "✅ Business Verified"
                                : businessInfo.rejection_reason
                                    ? "❌ Verification Rejected"
                                    : "⏳ Verification Pending"}
                        </p>

                        <p className="text-sm opacity-90 mt-1 leading-relaxed">
                            {businessInfo.is_verified &&
                                "Your business has been approved by our team. You can now access your lender account and start using all features."}

                            {!businessInfo.is_verified && !businessInfo.rejection_reason &&
                                "Your business information has been submitted and is under review by our admin team. Once approved, you'll gain access to your lender account."}

                            {businessInfo.rejection_reason &&
                                `Your business verification was rejected. Reason: ${businessInfo.rejection_reason}. Please update your information and resubmit for review.`}
                        </p>

                        {businessInfo.verified_at && (
                            <p className="text-xs mt-2 opacity-75">
                                Verified on {formatDate(businessInfo.verified_at)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Store Front Image */}
            {businessInfo.upload_storefront_photo && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Store Front Photo
                        </h3>
                    </div>
                    <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <Image
                            src={businessInfo.upload_storefront_photo}
                            alt={`${businessInfo.business_name || 'Business'} Store Front`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                {businessInfo.business_name || 'Business'} Storefront
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Business Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Details Card */}
                <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Building className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Business Details</h3>
                        </div>
                        <div className="space-y-4">
                            <InfoField
                                label="Business Name"
                                value={businessInfo.business_name as string || ""}
                                icon={<Building className="w-4 h-4" />}
                            />
                            <InfoField
                                label="Business Type"
                                value={businessInfo.business_type || ""}
                                capitalize
                                badge
                            />
                            <InfoField
                                label="Phone Number"
                                value={businessInfo.business_phone_number || ""}
                                icon={<Phone className="w-4 h-4" />}
                            />
                            {businessInfo.business_telephone && (
                                <InfoField
                                    label="Telephone"
                                    value={businessInfo.business_telephone}
                                    icon={<Phone className="w-4 h-4" />}
                                />
                            )}
                            <InfoField
                                label="Email"
                                value={businessInfo.business_email || ""}
                                icon={<Mail className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </Card>

                {/* Location & Address Card */}
                <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Location & Address</h3>
                        </div>
                        <div className="space-y-4">
                            <InfoField label="Region" value={businessInfo.address?.region || ""} badge />
                            <InfoField label="Province" value={businessInfo.address?.province || ""} />
                            <InfoField label="City" value={businessInfo.address?.city?.name || ""} />
                            <InfoField label="Barangay" value={businessInfo.address?.barangay || ""} />
                            <InfoField label="Street Address" value={businessInfo.address?.street || ""} />
                            <InfoField label="ZIP Code" value={businessInfo.address?.zip_code || ""} />
                            <InfoField
                                label="Complete Address"
                                value={businessInfo.address?.business_address || ""}
                                multiline
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Business Description Card */}
            <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <h3 className="text-lg font-semibold">About the Business</h3>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Description
                        </span>
                        <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-base text-foreground leading-relaxed">
                                {businessInfo.business_description || "No description provided for this business."}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Business Timeline Card */}
            <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Business Timeline</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField
                            label="Created At"
                            value={formatDate(businessInfo.created_at)}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                        <InfoField
                            label="Last Updated"
                            value={formatDate(businessInfo.updated_at)}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                        {businessInfo.verified_at && (
                            <InfoField
                                label="Verified At"
                                value={formatDate(businessInfo.verified_at)}
                                icon={<Award className="w-4 h-4 text-green-600" />}
                            />
                        )}
                        <InfoField
                            label="Terms & Conditions"
                            value={businessInfo.terms_and_conditions || ""}
                            badge
                        />
                    </div>
                </div>
            </Card>

            {/* Documents Status Card */}
            <Card className="p-6 border-2 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Document Status</h3>
                        </div>
                        <Badge
                            variant={
                                hasDocument(businessInfo.business_permit || "") &&
                                    hasDocument(businessInfo.dti_certificate || "") &&
                                    hasDocument(businessInfo.storefront_photo || "")
                                    ? "default"
                                    : "secondary"
                            }
                            className="text-xs"
                        >
                            {hasDocument(businessInfo.upload_business_permit || "") &&
                                hasDocument(businessInfo.upload_dti_certificate || "") &&
                                hasDocument(businessInfo.upload_storefront_photo || "")
                                ? "All Documents Complete"
                                : "Documents Incomplete"}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DocumentStatus
                            label="Business Permit"
                            hasDocument={hasDocument(businessInfo.upload_business_permit)}
                            documentUrl={businessInfo.upload_business_permit}
                        />
                        <DocumentStatus
                            label="DTI Certificate"
                            hasDocument={hasDocument(businessInfo.upload_dti_certificate)}
                            documentUrl={businessInfo.upload_dti_certificate}
                        />
                        <DocumentStatus
                            label="Storefront Photo"
                            hasDocument={hasDocument(businessInfo.upload_storefront_photo)}
                            documentUrl={businessInfo.upload_storefront_photo}
                        />
                    </div>

                    {/* Document Links Section */}
                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Document Links
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {businessInfo.upload_business_permit && (
                                <DocumentLink
                                    label="Business Permit"
                                    url={businessInfo.upload_business_permit}
                                />
                            )}
                            {businessInfo.upload_dti_certificate && (
                                <DocumentLink
                                    label="DTI Certificate"
                                    url={businessInfo.upload_dti_certificate}
                                />
                            )}
                            {businessInfo.upload_storefront_photo && (
                                <DocumentLink
                                    label="Storefront Photo"
                                    url={businessInfo.upload_storefront_photo}
                                />
                            )}
                        </div>
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
    icon?: React.ReactNode
    badge?: boolean
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, capitalize, multiline, icon, badge }) => (
    <div className="group">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {label}
        </span>
        <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>}
            {badge && value ? (
                <Badge variant="secondary" className={`${capitalize ? "capitalize" : ""} font-medium`}>
                    {value}
                </Badge>
            ) : (
                <span
                    className={`text-base font-medium text-foreground ${capitalize ? "capitalize" : ""} ${multiline ? "leading-relaxed" : ""
                        } ${!value ? "text-muted-foreground italic" : ""}`}
                >
                    {value || "Not provided"}
                </span>
            )}
        </div>
    </div>
)

interface DocumentStatusProps {
    label: string
    hasDocument: boolean
}

const DocumentStatus: React.FC<DocumentStatusProps> = ({ label, hasDocument }) => (
    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${hasDocument
        ? "border-green-200 bg-green-50 hover:bg-green-100"
        : "border-red-200 bg-red-50 hover:bg-red-100"
        }`}>
        <div className="flex-shrink-0">
            {hasDocument ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
                <XCircle className="w-5 h-5 text-red-600" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
            <p className={`text-xs font-medium ${hasDocument ? "text-green-600" : "text-red-600"}`}>
                {hasDocument ? "✓ Uploaded" : "✗ Missing"}
            </p>
        </div>
    </div>
)

interface DocumentLinkProps {
    label: string
    url: string
}

const DocumentLink: React.FC<DocumentLinkProps> = ({ label, url }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
    >
        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-sm text-muted-foreground group-hover:text-foreground font-medium">
            View {label}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">↗</span>
    </a>
)

// Rest of the component remains the same...
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
    switchError,
}) => {
    const getTargetRoleLabel = () => {
        return currentRole === "lender" ? "Switch to Borrower" : "Switch to Lender"
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <Card className="w-full mb-8 shadow-lg border">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-center">Your Lender Business Information</CardTitle>
                    <p className="text-center text-muted-foreground">Complete business profile and verification status</p>
                </CardHeader>
                <CardContent className="space-y-4 py-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground font-medium">
                            Current Role:{" "}
                            <Badge variant="outline" className="capitalize">
                                {currentRole}
                            </Badge>
                        </span>
                        <Badge variant={userData.business_info?.is_verified ? "default" : "secondary"} className="capitalize">
                            {userData.business_info?.is_verified ? "Verified" : "Pending Verification"}
                        </Badge>
                    </div>
                    <BusinessInfoGrid userData={userData} />
                </CardContent>
            </Card>

            {userData.business_info?.is_verified && (
                <Button
                    className="px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow text-lg"
                    onClick={onSwitchRole}
                    disabled={isSwitching}
                >
                    {isSwitching ? "Switching..." : getTargetRoleLabel()}
                </Button>
            )}

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
                    <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
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
                                        <p className="text-muted-foreground mt-2">This feature is coming soon</p>
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
            <FullScreenLoader isVisible={isSwitching} message="Switching roles..." />
        </div>
    )
}

export default SettingsSection