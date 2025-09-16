import { Skeleton } from '@/components/ui/skeleton'

const PostSkeleton = () => (
    <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            </div>
        </div>
    </div>
)

export default PostSkeleton 