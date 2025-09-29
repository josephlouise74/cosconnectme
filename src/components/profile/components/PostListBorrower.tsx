"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { useDeleteCommunityPost, useUpdateMyPost } from '@/lib/api/communityApi'

import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, MoreHorizontal, Share2, Loader2, Trash2, Edit2 } from 'lucide-react'
import Image from 'next/image'
import { memo, useCallback, useEffect, useReducer, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { toast } from 'sonner'

interface PostsListProps {
    profileData: any | null
}

interface Post {
    id: string
    content: string
    images: string[]
    likes: number
    comments: number
    createdAt: string
}

type PostsAction =
    | { type: 'SET_POSTS'; payload: Post[] }
    | { type: 'ADD_POSTS'; payload: Post[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_HAS_MORE'; payload: boolean }
    | { type: 'UPDATE_LIKE'; payload: { postId: string; liked: boolean } }
    | { type: 'REMOVE_POST'; payload: string }
    | { type: 'UPDATE_POST'; payload: Post }

interface PostsState {
    posts: Post[]
    loadingMore: boolean
    hasMore: boolean
    page: number
}

const initialState: PostsState = {
    posts: [],
    loadingMore: false,
    hasMore: true,
    page: 1
}

function postsReducer(state: PostsState, action: PostsAction): PostsState {
    switch (action.type) {
        case 'SET_POSTS':
            return { ...state, posts: action.payload }
        case 'ADD_POSTS':
            return {
                ...state,
                posts: [...state.posts, ...action.payload],
                page: state.page + 1
            }
        case 'SET_LOADING':
            return { ...state, loadingMore: action.payload }
        case 'SET_HAS_MORE':
            return { ...state, hasMore: action.payload }
        case 'UPDATE_LIKE':
            return {
                ...state,
                posts: state.posts.map(post =>
                    post.id === action.payload.postId
                        ? { ...post, likes: action.payload.liked ? post.likes + 1 : post.likes - 1 }
                        : post
                )
            }
        case 'REMOVE_POST':
            return {
                ...state,
                posts: state.posts.filter(post => post.id !== action.payload)
            }
        case 'UPDATE_POST':
            return {
                ...state,
                posts: state.posts.map(post =>
                    post.id === action.payload.id ? action.payload : post
                )
            }
        default:
            return state
    }
}

const DUMMY_POSTS: Post[] = Array(5).fill(null).map((_, i) => ({
    id: `post-${i}`,
    content: `This is sample post content #${i + 1}. This would be replaced with actual post data from the API.`,
    images: i % 2 === 0 ? [`/api/placeholder/${600 + i}/${400 + i}`] : [],
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    createdAt: new Date(Date.now() - i * 3600000 * 24).toISOString(),
}))

const PostsListBorrower = memo(({ profileData }: PostsListProps) => {
    const [state, dispatch] = useReducer(postsReducer, {
        ...initialState,
        posts: DUMMY_POSTS
    })

    const { userRolesData, isAuthenticated, isLoading: authLoading } = useSupabaseAuth()
    const { mutateAsync: deletePostById, isPending: isDeleting } = useDeleteCommunityPost()
    const { mutateAsync: updatePostById, isPending: isUpdating } = useUpdateMyPost()

    const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [editContent, setEditContent] = useState('')

    const { ref, inView } = useInView({ threshold: 0.5 })

    const loadMorePosts = useCallback(async () => {
        if (state.loadingMore || !state.hasMore) return

        dispatch({ type: 'SET_LOADING', payload: true })
        setTimeout(() => {
            const newPosts: Post[] = Array(3).fill(null).map((_, i) => ({
                id: `post-${state.posts.length + i}`,
                content: `This is sample post content #${state.posts.length + i + 1}. This would be loaded on scroll.`,
                images: (state.posts.length + i) % 2 === 0 ? [`/api/placeholder/${600 + i}/${400 + i}`] : [],
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 20),
                createdAt: new Date(Date.now() - (state.posts.length + i) * 3600000 * 24).toISOString(),
            }))

            dispatch({ type: 'ADD_POSTS', payload: newPosts })
            dispatch({ type: 'SET_LOADING', payload: false })

            if (state.page >= 3) {
                dispatch({ type: 'SET_HAS_MORE', payload: false })
            }
        }, 1000)
    }, [state.loadingMore, state.hasMore, state.posts.length, state.page])

    useEffect(() => {
        if (inView) loadMorePosts()
    }, [inView, loadMorePosts])

    const formatPostDate = useCallback((dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.round(diffMs / 60000)
        const diffHours = Math.round(diffMs / 3600000)
        const diffDays = Math.round(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }, [])

    const handleDeletePost = useCallback(async (postId: string) => {
        if (!isAuthenticated || !userRolesData?.user_id) {
            toast.warning("Please login first")
            return
        }

        setDeletingPostId(postId)
        try {
            await deletePostById({ postId, author_id: userRolesData.user_id })
            dispatch({ type: 'REMOVE_POST', payload: postId })
            toast.success("Post deleted successfully")
        } catch (error: any) {
            console.error('Delete error:', error)
        } finally {
            setDeletingPostId(null)
        }
    }, [isAuthenticated, userRolesData?.user_id, deletePostById])

    const handleEditPost = useCallback((post: Post) => {
        setEditingPost(post)
        setEditContent(post.content)
    }, [])

    const handleUpdatePost = useCallback(async () => {
        if (!editingPost || !isAuthenticated || !userRolesData?.user_id) return

        if (!editContent.trim()) {
            toast.error("Post content cannot be empty")
            return
        }

        try {
            await updatePostById({
                postId: editingPost.id,
                content: editContent,
            })

            dispatch({
                type: 'UPDATE_POST',
                payload: { ...editingPost, content: editContent }
            })
            setEditingPost(null)
            setEditContent('')
            toast.success("Post updated successfully")
        } catch (error: any) {
            console.error('Update error:', error)
        }
    }, [editingPost, editContent, isAuthenticated, userRolesData?.user_id, updatePostById])

    const PostItem = memo(({ post, index }: { post: Post; index: number }) => {
        const [liked, setLiked] = useState(false)
        const isCurrentlyDeleting = deletingPostId === post.id

        const handleLike = useCallback(() => {
            setLiked(prev => !prev)
            dispatch({
                type: 'UPDATE_LIKE',
                payload: { postId: post.id, liked: !liked }
            })
        }, [liked, post.id])

        const getInitials = profileData?.username
            ? profileData.username.split(' ').map((name: string) => name[0]).join('').toUpperCase()
            : 'U'

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
            >
                <Card className={cn(
                    "overflow-hidden hover:shadow-md transition-all relative",
                    isCurrentlyDeleting && "opacity-50"
                )}>
                    {isCurrentlyDeleting && (
                        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center z-20 rounded-lg backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Deleting post...
                                </p>
                            </div>
                        </div>
                    )}

                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    {profileData?.avatar ? (
                                        <AvatarImage src={profileData.avatar} alt={profileData.username} />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                                            {getInitials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="font-medium">{profileData?.username || 'User'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatPostDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={isCurrentlyDeleting || isDeleting}
                                    >
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {authLoading ? (
                                        <div className="flex justify-center items-center px-4 py-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => handleEditPost(post)}
                                                className="cursor-pointer gap-2"
                                                disabled={isDeleting || isUpdating}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                <span>Edit Post</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer gap-2"
                                                disabled={isDeleting || isUpdating}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete Post</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <p className="mb-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                            {post.content}
                        </p>

                        {post.images.length > 0 && (
                            <div className="relative h-60 w-full rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={post.images[0] as string}
                                    alt="Post image"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 hover:bg-rose-50 dark:hover:bg-rose-950",
                                    liked && "text-rose-600"
                                )}
                                onClick={handleLike}
                            >
                                <Heart size={16} className={cn(liked && "fill-rose-600")} />
                                <span className="font-medium">{post.likes}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                                <MessageCircle size={16} />
                                <span className="font-medium">{post.comments}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                                <Share2 size={16} />
                                <span className="font-medium">Share</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    })
    PostItem.displayName = 'PostItem'

    return (
        <>
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {state.posts.map((post, index) => (
                        <PostItem key={post.id} post={post} index={index} />
                    ))}
                </AnimatePresence>

                {state.loadingMore && (
                    <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-rose-500 animate-spin" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading more posts...</p>
                        </div>
                    </div>
                )}

                {state.hasMore && <div ref={ref} className="h-10 w-full" />}

                {!state.hasMore && state.posts.length > 0 && (
                    <div className="text-center py-8 border-t dark:border-gray-800">
                        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="h-px w-16 bg-gray-300 dark:bg-gray-700" />
                            <p className="text-sm font-medium">You've reached the end</p>
                            <div className="h-px w-16 bg-gray-300 dark:bg-gray-700" />
                        </div>
                    </div>
                )}

                {!state.hasMore && state.posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                    </div>
                )}
            </div>

            <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                        <DialogDescription>
                            Make changes to your post. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[180px] resize-none"
                            disabled={isUpdating}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {editContent.length} characters
                        </p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditingPost(null)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePost}
                            disabled={isUpdating || !editContent.trim() || editContent === editingPost?.content}
                            className="gap-2 min-w-[120px]"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
})

PostsListBorrower.displayName = 'PostsListBorrower'

export default PostsListBorrower