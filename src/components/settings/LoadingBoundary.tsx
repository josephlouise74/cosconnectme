import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React, { Suspense } from 'react'

const SettingsLoadingFallback = React.memo(() => (
    <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-2 p-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="flex items-center px-4 py-3">
                                        <Skeleton className="w-4 h-4 mr-3" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="space-y-4">
                                        <Skeleton className="h-6 w-40" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
))

SettingsLoadingFallback.displayName = 'SettingsLoadingFallback'

interface LoadingBoundaryProps {
    children: React.ReactNode
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({ children }) => (
    <Suspense fallback={<SettingsLoadingFallback />}>
        {children}
    </Suspense>
)

export default LoadingBoundary