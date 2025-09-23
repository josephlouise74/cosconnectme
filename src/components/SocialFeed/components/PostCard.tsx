"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import {
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  ShoppingCart,
  Tag,
  Shield,
  Star,
  DollarSign,
  Share
} from 'lucide-react';
import Link from 'next/link';
import { memo, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CommentDialog from './CommentDialog';
import ImageDialog from './ImageDialog';
import OptimizedPostImage from './OptimizedPostImage';
import { useLikePost } from '@/lib/api/communityApi';

// Define TypeScript interfaces
interface UserData {
  uid: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface PostData {
  id: string;
  content: string;
  images?: string[];
  created_at: string;
  heart_count: number;
  is_liked: boolean;
  comment_count: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  isForSale?: boolean;
  price?: number;
  currency?: string;
  category?: string;
}

interface PostCardProps {
  post: PostData;
  onSelect?: (post: PostData) => void;
  refetch?: () => void;
}

const PostCard = memo(({ post, onSelect, refetch }: PostCardProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [localLikeState, setLocalLikeState] = useState({
    isLiked: post.is_liked,
    likes: post.heart_count
  });

  const { userRolesData, isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const { mutateAsync: likePost, isPending: isLiking } = useLikePost();

  // Memoize current user from Supabase Auth
  const currentUser = useMemo((): UserData | undefined => {
    if (!userRolesData) return undefined;
    return {
      uid: userRolesData.user_id,
      name: userRolesData.personal_info?.full_name || userRolesData.username || 'Unknown User',
      avatar: userRolesData.personal_info?.profile_image || '/placeholder-avatar.jpg',
      email: userRolesData.email || '',
      role: userRolesData.current_role || 'user',
    };
  }, [userRolesData]);

  // Memoize post owner check
  const isPostOwner = useMemo(() => {
    return currentUser?.uid === post.author_id;
  }, [currentUser?.uid, post.author_id]);

  // Authentication check
  const checkAuthentication = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      toast.warning("Please login first");
      return false;
    }
    return true;
  }, [isAuthenticated, currentUser]);

  // Format time ago
  const formatTimeAgo = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return dateObj.toLocaleDateString();
  }, []);

  // Format price utility
  const formatPrice = useCallback((price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }, []);

  // Dialog handlers
  const handleCloseImageDialog = useCallback(() => {
    setIsImageDialogOpen(false);
  }, []);

  const handleOpenImageDialog = useCallback((index: number = 0) => {
    setSelectedImageIndex(index);
    setIsImageDialogOpen(true);
  }, []);

  const handleOpenCommentDialog = useCallback(() => {
    if (!checkAuthentication()) return;
    setIsCommentDialogOpen(true);
  }, [checkAuthentication]);

  const handleCloseCommentDialog = useCallback(() => {
    setIsCommentDialogOpen(false);
  }, []);

  // Delete post handler
  const handleDeletePost = useCallback(async (id: string) => {
    if (!checkAuthentication()) return;
    try {
      // TODO: Implement post deletion logic
      console.log('🗑️ DELETING POST:', id);
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  }, [checkAuthentication]);

  // Handle like functionality
  const handleLike = useCallback(async () => {
    if (!checkAuthentication() || !currentUser) return;

    const action = localLikeState.isLiked ? "unliked" : "liked";
    const likeData = {
      action,
      borrower: {
        uid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatar,
      },
      postId: post.id,
      postAuthor: post.author_id,
    };

    // Optimistic UI update
    const previousState = { ...localLikeState };
    setLocalLikeState(prev => ({
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1
    }));

    try {
      await likePost(likeData);
      refetch?.();
    } catch (error) {
      // Revert optimistic update on error
      setLocalLikeState(previousState);
    }
  }, [checkAuthentication, currentUser, post.id, post.author_id, localLikeState, likePost, refetch]);

  // Contact seller handler
  const handleContactSeller = useCallback(() => {
    if (!checkAuthentication()) return;
    toast.success("Contact seller feature coming soon!");
    // TODO: Implement contact seller logic
  }, [checkAuthentication]);

  // Author fallback initials
  const authorFallback = useMemo(() => {
    return post.author_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [post.author_name]);

  // Get role badge component
  const getRoleBadge = useCallback((role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            <Star className="h-3 w-3 mr-1" />
            Mod
          </Badge>
        );
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            Premium
          </Badge>
        );
      default:
        return null;
    }
  }, []);

  // Prepare post data for CommentDialog
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
    } as PostAuthor
  }), [post]);

  // Handle card click (avoid triggering on interactive elements)
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, [role="menuitem"], [role="dialog"]')) {
      return;
    }
    onSelect?.(post);
  }, [onSelect, post]);

  // Image grid layout
  const renderImages = useMemo(() => {
    const imageCount = post.images?.length || 0;
    if (imageCount === 0) return null;

    if (imageCount === 1) {
      return (
        <div
          className="cursor-pointer h-[400px] w-full"
          onClick={() => handleOpenImageDialog(0)}
        >
          <OptimizedPostImage src={post.images![0] as string} alt="Post image" index={0} />
        </div>
      );
    }

    // Multiple images grid
    return (
      <div className="grid grid-cols-2 gap-2 h-[400px]">
        {post.images!.slice(0, 4).map((img, idx) => (
          <div
            key={idx}
            className={`cursor-pointer relative ${idx === 0 ? 'row-span-2 col-span-2 h-[400px]' : 'h-[196px]'}`}
            onClick={() => handleOpenImageDialog(idx)}
          >
            <OptimizedPostImage src={img} alt={`Post image ${idx + 1}`} index={idx} />
            {idx === 3 && imageCount > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <span className="text-white font-semibold text-lg">+{imageCount - 4} more</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [post.images, handleOpenImageDialog]);

  return (
    <>
      <Card
        className={`w-full cursor-pointer transition-all duration-200 ${post.isForSale
          ? 'border-green-200 bg-gradient-to-b from-green-50/50 to-white shadow-lg hover:shadow-xl'
          : 'hover:shadow-md'
          }`}
        onClick={handleCardClick}
      >


        <CardHeader className={`${post.isForSale ? 'pb-3 pt-4' : 'pb-3'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className={`h-10 w-10 ${post.isForSale ? 'ring-2 ring-green-200' : ''}`}>
                <AvatarImage src={post.author_avatar} alt={post.author_name} />
                <AvatarFallback className={post.isForSale ? 'bg-green-100 text-green-700' : ''}>
                  {authorFallback}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Link
                    href={`/profile/${post.author_name}?role=${post.author_role}&id=${post.author_id}`}
                    className="font-semibold text-sm truncate hover:underline"
                  >
                    {post.author_name}
                  </Link>
                  {getRoleBadge(post.author_role)}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/community/${post.id}${currentUser?.uid ? `?userId=${currentUser.uid}&author_id=${post.author_id}` : ''}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {formatTimeAgo(post.created_at)}
                  </Link>
                  {post.isForSale && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                      Selling
                    </Badge>
                  )}
                </div>
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
                    <DropdownMenuItem className="cursor-pointer">
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Report
                    </DropdownMenuItem>
                    {post.isForSale && !isPostOwner && (
                      <DropdownMenuItem
                        onClick={handleContactSeller}
                        className="cursor-pointer text-blue-600"
                      >
                        Contact Seller
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Sale badges */}
          {post.isForSale && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {post.category && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {post.category}
                </Badge>
              )}
            </div>
          )}

          <p className="text-sm mb-4 whitespace-pre-wrap break-words">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              {renderImages}
            </div>
          )}

          {/* Actions Section */}
          <div className={`flex items-center justify-between mt-4 pt-4 ${post.isForSale ? 'border-t-2 border-green-100' : 'border-t'
            }`}>
            <div className="flex items-center space-x-6">
              {/* Like Button */}
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
                {isLiking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={`h-5 w-5 transition-all duration-200 ${localLikeState.isLiked
                      ? 'fill-current scale-110'
                      : 'hover:scale-110'
                      }`}
                  />
                )}
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

      {post.images && post.images.length > 0 && (
        <ImageDialog
          images={post.images}
          isOpen={isImageDialogOpen}
          onClose={handleCloseImageDialog}
          initialIndex={selectedImageIndex}
        />
      )}

      <CommentDialog
        post={postForCommentDialog}
        isOpen={isCommentDialogOpen}
        onClose={handleCloseCommentDialog}
        formatTimeAgo={formatTimeAgo}
        checkAuthentication={checkAuthentication}
        refetch={refetch}
      />
    </>
  );
});

PostCard.displayName = 'PostCard';
export default PostCard;