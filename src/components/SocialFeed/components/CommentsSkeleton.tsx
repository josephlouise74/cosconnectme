import { Skeleton } from '@/components/ui/skeleton'

const CommentsSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
)

export default CommentsSkeleton 