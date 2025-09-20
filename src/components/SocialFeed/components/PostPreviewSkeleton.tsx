import { Skeleton } from "@/components/ui/skeleton"

// Skeleton component for post preview
const PostPreviewSkeleton = () => (
    <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center space-x-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-20 w-full mb-3" />
        <div className="flex space-x-2">
            {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-24 rounded-lg" />
            ))}
        </div>
    </div>
)


export default PostPreviewSkeleton