"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { UserRolesResponseData } from '@/lib/types/userType'
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from "react-hook-form"
import * as z from "zod"

interface ProfileAboutCardBorrowerProps {
    profileData: UserRolesResponseData | null
    isOwnProfile?: boolean
}

// Bio update form schema
const bioFormSchema = z.object({
    bio: z.string().max(300, "Bio should be less than 300 characters").optional(),
})

type BioFormValues = z.infer<typeof bioFormSchema>

const ProfileAboutCardBorrower = ({
    profileData,
    isOwnProfile = false
}: ProfileAboutCardBorrowerProps) => {
    const [isEditBioOpen, setIsEditBioOpen] = useState(false)
    const { userRolesData } = useSupabaseAuth()

    // Use prop data or fallback to userRolesData
    const data = profileData || userRolesData

    // Form setup
    const form = useForm<BioFormValues>({
        resolver: zodResolver(bioFormSchema),
        defaultValues: {
            bio: data?.bio || '',
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

    if (!data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-gray-500 dark:text-gray-400">Loading profile information...</p>
                </CardContent>
            </Card>
        )
    }

    const { personal_info, address_information, email_verified, phone_verified } = data
    const displayBio = data.bio || personal_info?.bio

    return (
        <>
            <Card className="h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">About</CardTitle>
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
                            <p className="text-gray-500 dark:text-gray-400 italic">No bio added yet.</p>
                        )}

                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {/* Contact Information */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h3>
                                <div className="space-y-1.5">
                                    {data.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Email:</span>
                                            <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                                                {data.email}
                                                {email_verified && (
                                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                        (Verified)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {personal_info?.phone_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Phone:</span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {personal_info.phone_number}
                                                {phone_verified && (
                                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                        (Verified)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Information */}
                            {(address_information?.street || address_information?.city || address_information?.province) && (
                                <div className="space-y-2 pt-2">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                                    <div className="space-y-1.5 text-sm">
                                        {address_information.street && (
                                            <div className="flex items-start gap-2">
                                                <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Address:</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {address_information.street}
                                                </span>
                                            </div>
                                        )}

                                        {(address_information.city || address_information.province) && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-20"></span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {[address_information.city?.name, address_information.province]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {(address_information.region || address_information.country) && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-20"></span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {[address_information.region, address_information.country]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {address_information.zip_code && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-700 dark:text-gray-300 w-20">ZIP:</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {address_information.zip_code}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Bio Dialog */}
            <Dialog open={isEditBioOpen} onOpenChange={setIsEditBioOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Bio</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onBioSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About You</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell others about yourself..."
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

export default ProfileAboutCardBorrower