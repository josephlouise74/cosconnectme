import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

// Skeleton component for the main content area
const SettingsContentSkeleton = React.memo(() => (
    <Card className="w-full border-none shadow-none">
        <CardHeader className="px-6 pt-6 pb-4">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
            <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="flex-1 h-px" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="flex-1 h-px" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="flex-1 h-px" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </CardContent>
    </Card>
))

SettingsContentSkeleton.displayName = 'SettingsContentSkeleton'

export default SettingsContentSkeleton