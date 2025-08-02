"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from "react-hook-form"
import * as z from "zod"

interface ProfileAboutCardBorrowerProps {
    profileData: any
}

// Bio update form schema
const bioFormSchema = z.object({
    bio: z.string().max(300, "Bio should be less than 300 characters"),
})

type BioFormValues = z.infer<typeof bioFormSchema>

const ProfileAboutCardBorrower = ({ profileData }: ProfileAboutCardBorrowerProps) => {
    const [isEditBioOpen, setIsEditBioOpen] = useState(false)
    const [bio, setBio] = useState(profileData?.bio || '')

    // Form setup
    const form = useForm<BioFormValues>({
        resolver: zodResolver(bioFormSchema),
        defaultValues: {
            bio: profileData?.bio || '',
        },
    })

    const onBioSubmit = useCallback((values: BioFormValues) => {
        console.log('Updating bio:', values)
        setBio(values.bio)
        setIsEditBioOpen(false)
        // Here you would update the bio via API
    }, [])

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">About</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8"
                            onClick={() => setIsEditBioOpen(true)}
                        >
                            <Edit size={16} />
                        </Button>
                    </div>

                    <div className='flex flex-col'>
                        <div className="space-y-4">
                            {bio ? (
                                <p className="text-gray-600 dark:text-gray-300">{bio}</p>
                            ) : (
                                <p className="text-gray-400 italic">No bio added yet.</p>
                            )}

                            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                {profileData?.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Email:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{profileData.email}</span>
                                    </div>
                                )}

                                {profileData?.phoneNumber && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Phone:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{profileData.phoneNumber}</span>
                                    </div>
                                )}

                                {/* {profileData?.address && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Location:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{`${profileData.street} ${profileData.barangay} ${profileData.city.name} ${profileData.province} ${profileData.region}`}</span>
                                    </div>
                                )} */}

                                {profileData?.city?.name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">City:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{profileData.city.name}</span>
                                    </div>
                                )}

                                {profileData?.province && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Province:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{profileData.province}</span>
                                    </div>
                                )}

                                {profileData?.country && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Country:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{profileData.country}</span>
                                    </div>
                                )}
                            </div>

                            {profileData?.isVerified && (
                                <div className="mt-4 py-2 px-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-md text-green-700 dark:text-green-400 text-sm">
                                    <span className="font-medium">✓ Verified Account</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Bio Dialog */}
            <Dialog open={isEditBioOpen} onOpenChange={setIsEditBioOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Update Bio</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onBioSubmit)} className="space-y-4 mt-4">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about yourself..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditBioOpen(false)}>
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