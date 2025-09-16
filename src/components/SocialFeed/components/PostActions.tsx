import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react'

const PostActions = ({
    isLiked,
    heartCount,
    commentsCount,
    onLike,
    onComment,
    onRepost,
    onShare,
    isOwnPost,
}: {
    isLiked?: boolean
    heartCount?: number | string
    commentsCount?: number | string
    onLike: () => void
    onComment: () => void
    onRepost: () => void
    onShare: () => void
    isOwnPost?: boolean
}) => (
    <div className="flex items-center justify-between mt-4 max-w-md">
        {/* Like button: disable for own post */}
        <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className="flex items-center gap-2 px-0 hover:bg-transparent"
            disabled={isOwnPost}
        >
            <Heart
                className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
            />
            <span className="text-sm text-muted-foreground">{Number(heartCount) || 0}</span>
        </Button>

        <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex items-center gap-2 px-0 hover:bg-transparent"
        >
            <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-blue-500" />
            <span className="text-sm text-muted-foreground">{Number(commentsCount) || 0}</span>
        </Button>

        {/* Only show repost/share if not own post */}
        {!isOwnPost && (
            <>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRepost}
                    className="flex items-center gap-2 px-0 hover:bg-transparent"
                >
                    <Repeat2 className="h-5 w-5 text-muted-foreground hover:text-green-500" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="flex items-center gap-2 px-0 hover:bg-transparent"
                >
                    <Send className="h-5 w-5 text-muted-foreground hover:text-blue-500" />
                </Button>
            </>
        )}
    </div>
)

export default PostActions 