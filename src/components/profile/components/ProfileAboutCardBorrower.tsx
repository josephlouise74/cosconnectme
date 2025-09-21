
"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from "@hookform/resolvers/zod"
import { Building, Calendar, CheckCircle, Edit, Mail, MapPin, Phone, XCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from "react-hook-form"
import * as z from "zod"

interface ProcessedProfileData {
    type: 'business' | 'user'
    business?: {
        info: any
        addresses: any[]
        documents: any[]
        statistics: any
    }
    user?: any
    personal?: {
        addresses: any[]
        documents: any[]
        statistics: any
    }
    metadata: {
        role: 'borrower' | 'lender'
        created_at: string
        updated_at: string
        has_business_info?: boolean
    }
}

interface ProfileAboutCardProps {
    profileData: ProcessedProfileData | null
    role: 'borrower' | 'lender'
    isOwnProfile?: boolean
}

// Bio update form schema
const bioFormSchema = z.object({
    bio: z.string().max(300, "Bio should be less than 300 characters").optional(),
})

type BioFormValues = z.infer<typeof bioFormSchema>

const ProfileAboutCard = ({
    profileData,
    role,
    isOwnProfile = false
}: ProfileAboutCardProps) => {
    const [isEditBioOpen, setIsEditBioOpen] = useState(false)

    // Form setup
    const form = useForm<BioFormValues>({
        resolver: zodResolver(bioFormSchema),
        defaultValues: {
            bio: getBio(profileData) || '',
        },
    })

    const onBioSubmit = useCallback(async (values: BioFormValues) => {
        try {
            console.log('Updating bio:', values)
            // Here you would update the bio via API
            // await updateUserBio(values.bio)
            setIsEditBioOpen(false)
        } catch (error) {
            console.error('Failed to update bio:', error)
        }
    }, [])

    if (!profileData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-gray-500 dark:text-gray-400">Loading profile information...</p>
                </CardContent>
            </Card>
        )
    }

    const displayBio = getBio(profileData)

    return (
        <>
            <Card className="h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">About</CardTitle>
                            <Badge variant={role === 'lender' ? 'default' : 'secondary'} className="text-xs">
                                {role === 'lender' ? 'Business' : 'Personal'}
                            </Badge>
                        </div>
                        {isOwnProfile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setIsEditBioOpen(true)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit bio</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayBio ? (
                            <p className="text-gray-700 dark:text-gray-300">{displayBio}</p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                No {role === 'lender' ? 'business description' : 'bio'} added yet.
                            </p>
                        )}

                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {role === 'lender' ? (
                                <BusinessInfo profileData={profileData} />
                            ) : (
                                <PersonalInfo profileData={profileData} />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Bio Dialog */}
            <Dialog open={isEditBioOpen} onOpenChange={setIsEditBioOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Edit {role === 'lender' ? 'Business Description' : 'Bio'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onBioSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {role === 'lender' ? 'About Your Business' : 'About You'}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={role === 'lender'
                                                    ? "Tell others about your business..."
                                                    : "Tell others about yourself..."
                                                }
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {field.value?.length || 0}/300 characters
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditBioOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

// Helper component for business information
const BusinessInfo = ({ profileData }: { profileData: ProcessedProfileData }) => {
    if (profileData.type !== 'business' || !profileData.business) return null

    const { info, addresses, statistics } = profileData.business

    return (
        <>
            {/* Business Information */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Business Information
                </h3>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Type:</span>
                        <span className="text-gray-600 dark:text-gray-400">{info.business_type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{info.business_email}</span>
                        {info.verification?.is_verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                    </div>

                    {info.business_phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{info.business_phone_number}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Business Address */}
            {addresses.length > 0 && (
                <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Business Location
                    </h3>
                    {addresses.map((address, index) => (
                        <div key={address.id} className="text-sm text-gray-600 dark:text-gray-400">
                            <p>{address.full_address}</p>
                            {address.is_primary && (
                                <Badge variant="outline" className="text-xs mt-1">Primary</Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Verification Status */}
            <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Status</h3>
                <div className="flex items-center gap-2">
                    {info.verification?.is_verified ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">Business Verified</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">Pending Verification</span>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    {statistics.verified_documents}/{statistics.total_documents} documents verified
                </p>
            </div>
        </>
    )
}

// Helper component for personal information
const PersonalInfo = ({ profileData }: { profileData: ProcessedProfileData }) => {
    if (profileData.type !== 'user' || !profileData.user) return null

    const { user, personal, metadata } = profileData

    return (
        <>
            {/* Contact Information */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h3>
                <div className="space-y-1.5">
                    {user.email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{user.email}</span>
                            {user.email_verified && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                        </div>
                    )}

                    {user.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{user.phone_number}</span>
                            {user.phone_verified && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Information */}
            {personal && personal.addresses.length > 0 && (
                <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                    </h3>
                    {personal.addresses.map((address, index) => (
                        <div key={address.id} className="text-sm text-gray-600 dark:text-gray-400">
                            <p>{address.full_address}</p>
                            {address.address_info?.is_primary && (
                                <Badge variant="outline" className="text-xs mt-1">Primary</Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Account Status */}
            <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</h3>
                <div className="flex items-center gap-2">
                    <Badge variant={user.status === 'verified' ? 'default' : 'secondary'}>
                        {user.status}
                    </Badge>
                </div>
                {personal && (
                    <p className="text-xs text-gray-500">
                        {personal.statistics.verified_documents}/{personal.statistics.total_documents} documents verified
                    </p>
                )}
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <Calendar className="h-3 w-3" />
                <span>Member since {new Date(metadata.created_at).toLocaleDateString()}</span>
            </div>
        </>
    )
}

// Helper function to extract bio/description
function getBio(profileData: ProcessedProfileData | null): string | null {
    if (!profileData) return null

    if (profileData.type === 'business' && profileData.business) {
        return profileData.business.info.business_description || null
    } else if (profileData.type === 'user' && profileData.user) {
        return profileData.user.bio || null
    }

    return null
}

export default ProfileAboutCard