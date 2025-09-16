"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

import { Heart, Loader2, MessageCircle, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { memo, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import CommentDialog from './CommentDialog'
import ImageDialog from './ImageDialog'
import OptimizedPostImage from './OptimizedPostImage'

interface PostCardProps {
  post: any;
  onSelect?: (post: any) => void;
}

const PostCard = memo(({ post, onSelect }: PostCardProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [localLikeState, setLocalLikeState] = useState({
    isLiked: post.is_liked,
    likes: post.heart_count
  })

  const { userRolesData, isAuthenticated, isLoading: authLoading } = useSupabaseAuth();

  // Memoize current user from Supabase Auth
  const currentUser = useMemo(() => {
    if (!userRolesData) return undefined;
    return {
      uid: userRolesData.user_id,
      name: userRolesData.personal_info?.full_name || userRolesData.username,
      avatar: userRolesData.personal_info?.profile_image || '/placeholder-avatar.jpg',
      email: userRolesData.email,
      role: userRolesData.current_role,
    };
  }, [userRolesData]);

  // Memoize post owner check
  const isPostOwner = useMemo(() => {
    return currentUser?.uid === post.author_id;
  }, [currentUser?.uid, post.author_id]);



  // Stable reference for authentication check
  const checkAuthentication = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      // You may want to route to sign-in here if needed
      toast.warning("Please login first");
      return false;
    }
    return true;
  }, [isAuthenticated, currentUser]);

  // Memoize formatTimeAgo function
  const formatTimeAgo = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return dateObj.toLocaleDateString()
  }, [])

  // Stable dialog handlers
  const handleCloseDialog = useCallback(() => {
    setIsImageDialogOpen(false)
  }, [])

  const handleOpenImageDialog = useCallback((index: number = 0) => {
    setSelectedImageIndex(index)
    setIsImageDialogOpen(true)
  }, [])

  const handleOpenCommentDialog = useCallback(() => {
    if (!checkAuthentication()) return;
    console.log('💬 OPENING COMMENT DIALOG:', {
      postId: post.id,
      currentUserId: currentUser?.uid,
      currentUserName: currentUser?.name
    });
    setIsCommentDialogOpen(true);
  }, [checkAuthentication, post.id, currentUser]);

  const handleCloseCommentDialog = useCallback(() => {
    setIsCommentDialogOpen(false);
  }, []);

  // Handle comment submission
  const handleComment = useCallback(async (postId: string, comment: { content: string; images?: string[] }) => {
    if (!checkAuthentication()) return;

    try {
      // Prepare comment data in the correct format for backend
      const commentData = {
        post_id: postId,
        parent_comment_id: null, // For top-level comments
        commenter: {
          user_id: currentUser?.uid || '',
          username: currentUser?.name || '',
          user_avatar_url: currentUser?.avatar || '',
        },
        comment: {
          content: comment.content,
          images: comment.images || [],
        },
      };

      console.log('💬 COMMENT DATA FOR BACKEND:', commentData);

      // TODO: Implement comment posting logic
      // const response = await createComment(commentData);

      toast.success('Comment posted successfully!');

      // Close the dialog after successful comment
      handleCloseCommentDialog();

    } catch (error) {
      console.error('❌ COMMENT POSTING FAILED:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  }, [checkAuthentication, currentUser, handleCloseCommentDialog]);

  // Handle comment like
  const handleCommentLike = useCallback(async (commentId: string) => {
    if (!checkAuthentication()) return;

    try {
      console.log('👍 COMMENT LIKE:', {
        commentId,
        userId: currentUser?.uid,
        userName: currentUser?.name
      });

      // TODO: Implement comment like logic
      // await likeComment({ commentId, userId: currentUser?.uid });

    } catch (error) {
      console.error('❌ COMMENT LIKE FAILED:', error);
      toast.error('Failed to like comment. Please try again.');
    }
  }, [checkAuthentication, currentUser]);

  // Optimized delete handler using useDeletePostById
  const handleDeletePost = useCallback(async (id: string) => {
    if (!checkAuthentication()) return
    console.log('🗑️ DELETING POST:', {
      postId: id,
      currentUserId: currentUser?.uid,
      currentUserName: currentUser?.name,
      isPostOwner: isPostOwner
    });
    try {
      // TODO: Implement post deletion logic
    } catch (error: any) {
      // Error handled by hook toast
    }
  }, [checkAuthentication, currentUser, isPostOwner])

  // Handle like functionality
  const handleLike = useCallback(async () => {
    if (!checkAuthentication()) return


    // Prepare data for backend in the correct format
    const likeData = {
      action: localLikeState.isLiked ? "unliked" : "liked",
      borrower: {
        uid: currentUser?.uid || '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        avatarUrl: currentUser?.avatar || undefined
      },
      postId: post.id,
      postAuthor: post.author_id,
      timestamp: new Date().toISOString()
    };

    console.log("sss", likeData)


    setIsLiking(true)
    try {
      // Optimistic update
      setLocalLikeState(prev => ({
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      }))

      // TODO: Implement actual like API call here
      // await heartCommunityPost(likeData)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error) {
      // Revert optimistic update on error
      setLocalLikeState(prev => ({
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes + 1 : prev.likes - 1
      }))
      console.error('❌ LIKE ACTION FAILED:', error);
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }, [checkAuthentication, post.id, post.author_id, post.author_name, currentUser, localLikeState])

  // Memoize author name fallback
  const authorFallback = useMemo(() => {
    return post.author_name.split(' ').map((n: any) => n[0]).join('').toUpperCase()
  }, [post.author_name])

  // Convert any to MarketPlacePostDataType for CommentDialog
  const postForCommentDialog = useMemo(() => ({
    id: post.id,
    content: post.content,
    images: post.images || [],
    createdAt: post.created_at,
    likes: post.heart_count,
    isLiked: post.is_liked,
    comments: post.comment_count,
    author: {
      id: post.author_id,
      name: post.author_name,
      avatar: post.author_avatar,
      role: post.author_role
    }
  }), [post]);

  // Only call onSelect when clicking the card background, not interactive elements
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent selection if clicking on a button, link, dropdown, or menu item
    if ((e.target as HTMLElement).closest('button, a, [role="menuitem"], [role="dialog"], [tabindex="0"]')) {
      return;
    }
    onSelect?.(post);
  };

  return (
    <>
      <Card className="w-full cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author_avatar} alt={post.author_name} />
                <AvatarFallback>
                  {authorFallback}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/community/${post.id}${currentUser?.uid ? `?userId=${currentUser.uid}&author_id=${post.author_id}` : ''}`}
                    className="font-semibold text-sm truncate hover:underline"
                  >
                    {post.author_name}
                  </Link>
                </div>
                <Link
                  href={`/community/${post.id}${currentUser?.uid ? `?userId=${currentUser.uid}&author_id=${post.author_id}` : ''}`}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  {formatTimeAgo(post.created_at)}
                </Link>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {authLoading ? (
                  <div className="flex justify-center items-center px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {isPostOwner && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 focus:text-red-500 cursor-pointer"
                          disabled={authLoading}
                        >
                          Delete Post
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-green-500 focus:text-green-500 cursor-pointer">
                          Update Post
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="cursor-pointer">Copy Link</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Report</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm mb-4 whitespace-pre-wrap break-words">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.images.map((img: string, idx: number) => (
                <div key={idx} onClick={() => handleOpenImageDialog(idx)} className="cursor-pointer">
                  <OptimizedPostImage src={img} alt={`Post image ${idx + 1}`} index={idx} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-6">
              {/* Heart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 transition-all duration-200 ${localLikeState.isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-muted-foreground hover:text-red-500'
                  }`}
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 ${localLikeState.isLiked
                    ? 'fill-current scale-110'
                    : 'hover:scale-110'
                    }`}
                />
                <span className="text-sm font-medium">
                  {localLikeState.likes > 0 ? localLikeState.likes : ''}
                </span>
              </Button>

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenCommentDialog}
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors"
                aria-label="View comments"
              >
                <MessageCircle className="h-5 w-5 hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">
                  {Number(post.comment_count)}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Dialog */}
      {post.images && post.images.length > 0 && (
        <ImageDialog
          images={post.images as string[]}
          isOpen={isImageDialogOpen}
          onClose={handleCloseDialog}
          initialIndex={selectedImageIndex}
        />
      )}

      {/* Comment Dialog */}
      <CommentDialog
        post={postForCommentDialog}
        isOpen={isCommentDialogOpen}
        onClose={handleCloseCommentDialog}
        onComment={handleComment}
        onCommentLike={handleCommentLike}
        comments={[]} // TODO: Fetch comments for this post
        formatTimeAgo={formatTimeAgo}
        checkAuthentication={checkAuthentication}
      />
    </>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard