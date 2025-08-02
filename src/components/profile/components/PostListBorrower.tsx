"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useDeletePostById } from '@/lib/apis/communityApiV2'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, MoreHorizontal, Share2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { memo, useCallback, useEffect, useReducer, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { toast } from 'sonner'

interface PostsListProps {
    profileData: any | null
}

// Define post type
interface Post {
    id: string
    content: string
    images: string[]
    likes: number
    comments: number
    createdAt: string
}

// Define action types
type PostsAction =
    | { type: 'SET_POSTS'; payload: Post[] }
    | { type: 'ADD_POSTS'; payload: Post[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_HAS_MORE'; payload: boolean }
    | { type: 'UPDATE_LIKE'; payload: { postId: string; liked: boolean } }
    | { type: 'REMOVE_POST'; payload: string }

// Define state type
interface PostsState {
    posts: Post[]
    loadingMore: boolean
    hasMore: boolean
    page: number
}

// Initial state
const initialState: PostsState = {
    posts: [],
    loadingMore: false,
    hasMore: true,
    page: 1
}

// Reducer function
function postsReducer(state: PostsState, action: PostsAction): PostsState {
    switch (action.type) {
        case 'SET_POSTS':
            return {
                ...state,
                posts: action.payload
            }
        case 'ADD_POSTS':
            return {
                ...state,
                posts: [...state.posts, ...action.payload],
                page: state.page + 1
            }
        case 'SET_LOADING':
            return {
                ...state,
                loadingMore: action.payload
            }
        case 'SET_HAS_MORE':
            return {
                ...state,
                hasMore: action.payload
            }
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
        default:
            return state
    }
}

// Dummy posts data for demonstration
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

    const { userRolesData, isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
    const { deletePostById, isDeleting } = useDeletePostById();

    // Ref for infinite scrolling
    const { ref, inView } = useInView({
        threshold: 0.5,
    })

    // Load more posts when scrolling to the bottom
    const loadMorePosts = useCallback(async () => {
        if (state.loadingMore || !state.hasMore) return

        dispatch({ type: 'SET_LOADING', payload: true })
        // Simulate API call with setTimeout
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

            // Stop infinite scrolling after a few pages for demo purposes
            if (state.page >= 3) {
                dispatch({ type: 'SET_HAS_MORE', payload: false })
            }
        }, 1000)
    }, [state.loadingMore, state.hasMore, state.posts.length, state.page])

    // Check if bottom is reached and load more posts
    useEffect(() => {
        if (inView) {
            loadMorePosts()
        }
    }, [inView, loadMorePosts])

    // Format post date
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

    // Handle delete post
    const handleDeletePost = useCallback(async (postId: string) => {
        if (!isAuthenticated || !userRolesData?.user_id) {
            toast.warning("Please login first");
            return;
        }

        try {
            await deletePostById({ postId, author_id: userRolesData.user_id });
            // Remove post from local state
            dispatch({ type: 'REMOVE_POST', payload: postId });
        } catch (error: any) {
            // Error handled by hook toast
        }
    }, [isAuthenticated, userRolesData?.user_id, deletePostById]);

    // Individual Post Component
    const PostItem = memo(({ post, index }: { post: Post; index: number }) => {
        const [liked, setLiked] = useState(false)

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
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                                    <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {authLoading ? (
                                        <div className="flex justify-center items-center px-4 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <>
                                            <DropdownMenuItem>Edit Post</DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                disabled={authLoading || isDeleting}
                                            >
                                                {isDeleting ? 'Deleting...' : 'Delete Post'}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <p className="mb-4">{post.content}</p>

                        {post.images.length > 0 && (
                            <div className="relative h-60 w-full rounded-md overflow-hidden mb-4">
                                <Image
                                    src={post.images[0] as string}
                                    alt="Post image"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2",
                                    liked && "text-rose-600"
                                )}
                                onClick={handleLike}
                            >
                                <Heart size={16} className={cn(liked && "fill-rose-600")} />
                                <span>{post.likes}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="gap-2">
                                <MessageCircle size={16} />
                                <span>{post.comments}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="gap-2">
                                <Share2 size={16} />
                                <span>Share</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    })
    PostItem.displayName = 'PostItem'

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {state.posts.map((post, index) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        index={index}
                    />
                ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {state.loadingMore && (
                <div className="flex justify-center py-4">
                    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-rose-500 animate-spin"></div>
                </div>
            )}

            {/* Invisible element for intersection observer */}
            {state.hasMore && <div ref={ref} className="h-10 w-full" />}

            {/* End of feed message */}
            {!state.hasMore && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>You've reached the end of posts</p>
                </div>
            )}
        </div>
    )
})

PostsListBorrower.displayName = 'PostsListBorrower'

export default PostsListBorrower