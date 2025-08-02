"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const ProfileSkeletonBorrower = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Cover Photo Skeleton */}
            <Skeleton className="h-80 w-full" />

            {/* Profile Info Skeleton */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
                    {/* Avatar Skeleton */}
                    <Skeleton className="h-36 w-36 rounded-full" />

                    {/* Name and Username Skeleton */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 w-full">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Left Column Skeleton */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-24 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-4" />

                                <div className="space-y-2 pt-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="md:col-span-2">
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-10 flex-1 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div>
                                                    <Skeleton className="h-4 w-24 mb-1" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>

                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-3/4 mb-4" />

                                        {i % 2 === 0 && <Skeleton className="h-60 w-full rounded-md mb-4" />}

                                        <div className="flex items-center justify-between pt-2">
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-20" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileSkeletonBorrower