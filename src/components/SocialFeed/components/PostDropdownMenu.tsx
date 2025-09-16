import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Edit3, Flag, Link2, MoreHorizontal, Trash2, Loader2 } from 'lucide-react'

const PostDropdownMenu = ({
    isOwnPost,
    onEdit,
    onDelete,
    onCopyLink,
    onReport,
    isDeleting
}: {
    isOwnPost: boolean
    onEdit: () => void
    onDelete: () => void
    onCopyLink: () => void
    onReport: () => void
    isDeleting?: boolean
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
            {isOwnPost ? (
                <>
                    <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="cursor-pointer text-destructive focus:text-destructive"
                        disabled={isDeleting || false}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete post
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            ) : (
                <>
                    <DropdownMenuItem onClick={onReport} className="cursor-pointer">
                        <Flag className="mr-2 h-4 w-4" />
                        Report post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer">
                <Link2 className="mr-2 h-4 w-4" />
                Copy link
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)

export default PostDropdownMenu 
