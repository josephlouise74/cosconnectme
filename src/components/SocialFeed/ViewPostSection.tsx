'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';

import { useParams, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CommentsSection from './components/CommentSection';
import PostActions from './components/PostActions';
import PostDropdownMenu from './components/PostDropdownMenu';
import PostSkeleton from './components/PostSkeleton';
import { error } from 'console';

const ViewPostSection = () => {
    // URL params
    const params = useParams();
    const searchParams = useSearchParams();

    let postId = '';
    if (typeof params?.postId === 'string') {
        postId = params.postId;
    } else if (Array.isArray(params?.postId) && params.postId.length > 0) {
        postId = params.postId[0] as string;
    }

    const author_id = searchParams?.get('author_id') || '';
    const viewer_id = searchParams?.get('userId') || '';

    // Auth and user data
    const { userRolesData } = useSupabaseAuth();
    const currentUserId = userRolesData?.user_id;
    const currentUserAvatar = userRolesData?.personal_info?.profile_image;
    const currentUserName = userRolesData?.personal_info?.full_name || userRolesData?.username || 'U';

    // API hooks


    // Comments state
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [totalCommentsCount, setTotalCommentsCount] = useState(0);

    // Reply state management
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [replyLoadingStates, setReplyLoadingStates] = useState<Record<string, boolean>>({});
    const [commentReplies, setCommentReplies] = useState<Record<string, any[]>>({});


    // Map comments with proper reply_count and showReplies state
    const comments = useMemo(() => {
        const mappedComments = [] as any[];
        return mappedComments.map(comment => ({
            ...comment,
            replies_count: comment.reply_count || 0, // Map reply_count to replies_count
            showReplies: expandedReplies[comment.id] || false,
            replies: commentReplies[comment.id] || []
        }));

        // Debug: Log comments with reply counts
        /*      console.log('📝 Mapped comments:', mappedComments.map(c => ({
                 id: c.id,
                 content: c.content.substring(0, 30) + '...',
                 reply_count: c.reply_count,
                 replies_count: c.replies_count,
                 showReplies: c.showReplies
             })));
     
             return mappedComments; */
    }, [expandedReplies, commentReplies]);

    // Reply state management with cursors and hasMore
    const [replyCursors, setReplyCursors] = useState<Record<string, string | null>>({});
    const [replyHasMore, setReplyHasMore] = useState<Record<string, boolean>>({});
    const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});

    // Fetch replies for a specific comment using the dedicated API function
    const fetchRepliesForCommentHandler = useCallback(async (commentId: string) => {
        if (replyLoadingStates[commentId]) return;

        setReplyLoadingStates(prev => ({ ...prev, [commentId]: true }));

        try {
            const cursor = replyCursors[commentId] || null;

            // Use the dedicated fetchRepliesForComment API function
            /*    const response = await fetchRepliesForComment({
                   comment_id: commentId,
                   limit: 10,
                   cursor
               });
    */
            const replies = [] as any[];
            const hasMore = false;
            const nextCursor = null;

            setCommentReplies(prev => ({
                ...prev,
                [commentId]: cursor ? [...(prev[commentId] || []), ...replies] : replies
            }));

            setReplyCursors(prev => ({
                ...prev,
                [commentId]: nextCursor
            }));

            setReplyHasMore(prev => ({
                ...prev,
                [commentId]: hasMore
            }));

            // Update reply count for this comment
            setReplyCounts(prev => ({
                ...prev,
                [commentId]: (prev[commentId] || 0) + replies.length
            }));

            console.log(`📝 Fetched replies for comment ${commentId}:`, replies);
        } catch (error) {
            console.error(`Failed to fetch replies for comment ${commentId}:`, error);
            toast.error('Failed to load replies');
        } finally {
            setReplyLoadingStates(prev => ({ ...prev, [commentId]: false }));
        }
    }, [replyLoadingStates, replyCursors]);

    // Toggle replies for a comment (Facebook-style)
    const handleToggleReplies = useCallback(async (commentId: string) => {
        const isCurrentlyExpanded = expandedReplies[commentId];

        if (!isCurrentlyExpanded) {
            // Expand replies - fetch them if not already loaded
            setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
            await fetchRepliesForCommentHandler(commentId);
        } else {
            // Collapse replies
            setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
        }

        return Promise.resolve();
    }, [expandedReplies, fetchRepliesForCommentHandler]);

    // Load more replies for a specific comment (Facebook-style)
    const handleLoadMoreReplies = useCallback(async (commentId: string) => {
        if (replyLoadingStates[commentId] || !replyHasMore[commentId]) return;

        setReplyLoadingStates(prev => ({ ...prev, [commentId]: true }));

        try {
            const cursor = replyCursors[commentId];
            if (!cursor) return;

            // Use the dedicated fetchRepliesForComment API function
            /*    const response = await fetchRepliesForComment({
                    comment_id: commentId,
                    limit: 10,
                    cursor
                });
    */
            const replies = [] as any[];
            const hasMore = false;
            const nextCursor = null;

            setCommentReplies(prev => ({
                ...prev,
                [commentId]: [...(prev[commentId] || []), ...replies]
            }));

            setReplyCursors(prev => ({
                ...prev,
                [commentId]: nextCursor
            }));

            setReplyHasMore(prev => ({
                ...prev,
                [commentId]: hasMore
            }));

            // Update reply count
            setReplyCounts(prev => ({
                ...prev,
                [commentId]: (prev[commentId] || 0) + replies.length
            }));

            console.log(`📝 Loaded more replies for comment ${commentId}:`, replies);
        } catch (error) {
            console.error(`Failed to load more replies for comment ${commentId}:`, error);
            toast.error('Failed to load more replies');
        } finally {
            setReplyLoadingStates(prev => ({ ...prev, [commentId]: false }));
        }
    }, [replyLoadingStates, replyHasMore, replyCursors]);

    // Update total comments count when comments change
    useEffect(() => {
        if (comments.length > 0) {
            setTotalCommentsCount(comments.length);
        }
    }, [comments]);

    // Update cursor when nextCursor changes
    useEffect(() => {
        setCursor(null);
    }, []);

    // Handler to load more comments
    const handleLoadMoreComments = useCallback(async () => {
        if (!cursor) return Promise.resolve();
        setCursor(cursor);
        return Promise.resolve();
    }, [cursor]);

    // Memoized current user
    const currentUser = useMemo(() => ({
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
    }), [currentUserId, currentUserName, currentUserAvatar]);

    // --- Like state for heart button ---
    const [isLiking, setIsLiking] = useState(false);
    const [localLikeState, setLocalLikeState] = useState({
        isLiked: false,
        likes: 0,
    });

    // Update local like state when post data changes
    /*     useEffect(() => {
            if (data?.data) {
                setLocalLikeState({
                    isLiked: Boolean(data.data.is_liked),
                    likes: data.data.heart_count || 0,
                });
            }
        }, [data]); */

    // Like handler (optimistic update, similar to PostCard)
    const handleLike = useCallback(async () => {
        if (!currentUserId) {
            toast.warning('Please login first');
            return;
        }
        setIsLiking(true);
        try {
            setLocalLikeState(prev => ({
                isLiked: !prev.isLiked,
                likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            }));
            // TODO: Implement actual like API call here
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            setLocalLikeState(prev => ({
                isLiked: !prev.isLiked,
                likes: prev.isLiked ? prev.likes + 1 : prev.likes - 1,
            }));
            toast.error('Failed to like post');
        } finally {
            setIsLiking(false);
        }
    }, [currentUserId]);

    // Comment handlers
    const handleSubmitComment = useCallback(async (content: string) => {
        if (!content.trim() || isSubmittingComment) return;

        try {
            // Prepare comment data according to schema
            const commentData = {
                post_id: postId,
                parent_comment_id: null, // Top-level comment
                commenter: {
                    user_id: currentUserId || '',
                    username: currentUserName || '',
                    user_avatar_url: currentUserAvatar || '',
                },
                comment: {
                    content: content.trim(),
                    images: [],
                },
            };

            console.log('💬 SUBMITTING COMMENT:', commentData);

            // Call the API
            /*      await commentOnPost(commentData);
     
                 // Refetch comments after successful submission
                 await refetchComments(); */
            toast.success('Comment submitted successfully');
        } catch (error) {
            // Error is handled by the hook
            console.error('Failed to submit comment:', error);
        }
    }, [postId, currentUserId, currentUserName, currentUserAvatar, isSubmittingComment]);

    const handleSubmitReply = useCallback(async (parentId: string, content: string) => {
        if (!content.trim()) return;

        try {
            // Prepare reply data according to schema
            const replyData = {
                post_id: postId,
                parent_comment_id: parentId, // Use the comment.id as parent_comment_id
                commenter: {
                    user_id: currentUserId || '',
                    username: currentUserName || '',
                    user_avatar_url: currentUserAvatar || '',
                },
                comment: {
                    content: content.trim(),
                    images: [],
                },
            };

            console.log('💬 SUBMITTING REPLY:', replyData);

            // Call the API
            /*         await replyToComment(replyData);
        
                    // Refetch comments after successful submission
                    await refetchComments(); */
            toast.success('Reply submitted successfully');
        } catch (error) {
            // Error is handled by the hook
            console.error('Failed to submit reply:', error);
        }
    }, [postId, currentUserId, currentUserName, currentUserAvatar]);

    // Comment like handler
    const handleLikeComment = useCallback(async (commentId: string) => {
        toast.info('Like functionality coming soon!');
        return Promise.resolve();
    }, []);

    // Sort change handler
    const handleSortChange = useCallback((sortBy: 'newest' | 'oldest' | 'popular') => {
        setSortBy(sortBy);
    }, []);

    // Post handlers
    const handleEdit = useCallback(() => {
        console.log('Edit post');
    }, []);

    const handleDelete = useCallback(() => {
        console.log('Delete post');
    }, []);

    const handleCopyLink = useCallback(() => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    }, []);

    const handleReport = useCallback(() => {
        console.log('Report post');
    }, []);

    const handleComment = useCallback(() => {
        console.log('Comment on post');
    }, []);

    const handleRepost = useCallback(() => {
        console.log('Repost post');
    }, []);

    const handleShare = useCallback(() => {
        console.log('Share post');
    }, []);

    // Loading state
    /*   if (isLoading) {
          return <PostSkeleton />;
      }
  
      // Error state
      if (isError || !data || !data.data) {
          return (
              <div className="min-h-screen flex items-center justify-center">
                  Error: {error instanceof Error ? error.message : 'Post not found.'}
              </div>
          );
      } */

    const post = {};
    const isOwnPost = false;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto">
                {/* Main Post Section */}
                <div className="bg-white border-b">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            {/* Avatar and Author */}
                            <Avatar className="h-10 w-10">
                                {currentUser.avatar ? (
                                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                ) : (
                                    <AvatarFallback>{currentUser.name?.[0]?.toUpperCase()}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-semibold text-sm truncate text-gray-900">
                                            {currentUser.name}
                                        </span>
                                        {/*                                         {currentUser.role && (
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {currentUser.role}
                                            </span>
                                        )} */}
                                        {/*  <span className="text-xs text-gray-500">
                                            {new Date(post.created_at).toLocaleString()}
                                        </span> */}
                                    </div>
                                    <PostDropdownMenu
                                        isOwnPost={isOwnPost}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onCopyLink={handleCopyLink}
                                        onReport={handleReport}
                                    />
                                </div>

                                {/*    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-4 text-gray-800">
                                    {post.content}
                                </p> */}

                                <PostActions
                                    isLiked={localLikeState.isLiked}
                                    heartCount={localLikeState.likes}
                                    commentsCount={comments.length}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                    onRepost={handleRepost}
                                    onShare={handleShare}
                                    isOwnPost={isOwnPost}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentsSection
                    comments={comments}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    isSubmittingComment={false || false}
                    commentsLoading={false}
                    hasMore={false}
                    loadingStates={{ loadingMore: false }}
                    currentUser={{ ...currentUser, avatar: currentUser.avatar ?? undefined }}
                    onSubmitComment={handleSubmitComment}
                    onReply={handleSubmitReply}
                    onLike={handleLikeComment}
                    onToggleReplies={handleToggleReplies}
                    onLoadMore={handleLoadMoreComments}
                    totalCommentsCount={totalCommentsCount}
                    expandedReplies={expandedReplies}
                    replyLoadingStates={replyLoadingStates}
                    commentReplies={commentReplies}
                    replyHasMore={replyHasMore}
                    onLoadMoreReplies={handleLoadMoreReplies}
                />
            </div>
        </div>
    );
};

export default ViewPostSection;