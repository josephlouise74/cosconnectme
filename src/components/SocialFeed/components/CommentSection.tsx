import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CommunityComment } from '@/types/postType';
import { MessageCircle, Send } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';
import CommentItem from './CommentItem';

interface CurrentUser {
    id: string | undefined;
    name: string;
    avatar: string | undefined;
}

interface CommentWithMeta extends CommunityComment {
    heart_count?: number;
    is_liked?: boolean;
    replies_count?: number;
    replies?: CommentWithMeta[];
    showReplies?: boolean;
}

interface CommentsSectionProps {
    comments: CommentWithMeta[];
    sortBy: 'newest' | 'oldest' | 'popular';
    setSortBy: (value: 'newest' | 'oldest' | 'popular') => void;
    isSubmittingComment: boolean;
    commentsLoading: boolean;
    hasMore: boolean;
    loadingStates: Record<string, boolean>;
    currentUser: CurrentUser;
    onSubmitComment: (content: string) => Promise<void>;
    onReply: (parentId: string, content: string) => Promise<void>;
    onLike: (commentId: string) => Promise<void>;
    onToggleReplies: (commentId: string) => Promise<void>;
    onLoadMore: () => Promise<void>;
    totalCommentsCount?: number;
    expandedReplies?: Record<string, boolean>;
    replyLoadingStates?: Record<string, boolean>;
    commentReplies?: Record<string, CommunityComment[]>;
    replyHasMore?: Record<string, boolean>;
    onLoadMoreReplies?: (commentId: string) => Promise<void>;
}

const CommentForm = memo(({
    onSubmit,
    isSubmitting,
    currentUser,
    placeholder = "Write a comment...",
    maxLength = 1000
}: {
    onSubmit: (content: string) => Promise<void>;
    isSubmitting: boolean;
    currentUser: CurrentUser;
    placeholder?: string;
    maxLength?: number;
}) => {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        try {
            await onSubmit(content);
            setContent('');
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <Avatar className="h-10 w-10">
                {currentUser.avatar ? (
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                )}
            </Avatar>
            <div className="flex-1">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows={1}
                    maxLength={maxLength}
                    className="resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{content.length}/{maxLength}</span>
                    <Button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span>Comment</span>
                    </Button>
                </div>
            </div>
        </form>
    );
});

CommentForm.displayName = 'CommentForm';

const LoadingSkeleton = memo(() => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                    <div className="bg-gray-200 rounded-2xl p-4">
                        <div className="h-4 bg-gray-300 rounded mb-2 w-1/4" />
                        <div className="h-4 bg-gray-300 rounded mb-1 w-3/4" />
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                </div>
            </div>
        ))}
    </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const EmptyState = memo(() => (
    <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
    </div>
));

EmptyState.displayName = 'EmptyState';

const CommentsSection: React.FC<CommentsSectionProps> = ({
    comments,
    sortBy,
    setSortBy,
    isSubmittingComment,
    commentsLoading,
    hasMore,
    loadingStates,
    currentUser,
    onSubmitComment,
    onReply,
    onLike,
    onToggleReplies,
    onLoadMore,
    totalCommentsCount,
    expandedReplies = {},
    replyLoadingStates = {},
    commentReplies = {},
    replyHasMore = {},
    onLoadMoreReplies
}) => {
    return (
        <div className="bg-white border-t">
            <div className="px-4 py-6">
                {/* Comments Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Comments ({totalCommentsCount ?? comments.length})
                    </h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                            <SelectItem value="popular">Most popular</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Comment Form */}
                <div className="mb-6">
                    <CommentForm
                        onSubmit={onSubmitComment}
                        isSubmitting={isSubmittingComment}
                        currentUser={currentUser}
                    />
                </div>

                {/* Comments List */}
                {commentsLoading && comments.length === 0 ? (
                    <LoadingSkeleton />
                ) : comments.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => {
                            console.log('Comment:', {
                                id: comment.id,
                                parent_comment_id: comment.parent_comment_id,
                                content: comment.content.substring(0, 50) + '...',
                                author: comment.author_name,
                                reply_count: comment.reply_count
                            });
                            return (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={currentUser}
                                    loadingStates={loadingStates}
                                    onReply={onReply}
                                    onLike={onLike}
                                    onToggleReplies={onToggleReplies}
                                    depth={0}
                                    isRepliesExpanded={expandedReplies[comment.id] || false}
                                    isRepliesLoading={replyLoadingStates[comment.id] || false}
                                    replies={commentReplies[comment.id] || []}
                                    hasMoreReplies={replyHasMore[comment.id] || false}
                                    {...(onLoadMoreReplies && { onLoadMoreReplies })}
                                />
                            );
                        })}

                        {hasMore && (
                            <Button
                                onClick={onLoadMore}
                                className="w-full py-3 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                                variant="link"
                                disabled={loadingStates.loadingMore}
                            >
                                {loadingStates.loadingMore ? 'Loading...' : 'Load more comments'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(CommentsSection);