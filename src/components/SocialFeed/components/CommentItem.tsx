import { useState, useRef, useEffect, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Reply, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import PostImages from './PostImages';

interface CommentWithMeta {
    id: string;
    content: string;
    author_name: string;
    author_avatar?: string;
    author_role?: string;
    created_at: string;
    heart_count?: number;
    is_liked?: boolean;
    replies_count?: number;
    replies?: CommentWithMeta[];
    showReplies?: boolean;
}

interface CurrentUser {
    id: string | undefined;
    name: string;
    avatar: string | undefined;
}

interface CommentItemProps {
    comment: CommentWithMeta;
    currentUser: CurrentUser;
    loadingStates: Record<string, boolean>;
    onReply: (parentId: string, content: string) => Promise<void>;
    onLike: (commentId: string) => Promise<void>;
    onToggleReplies: (commentId: string) => Promise<void>;
    depth: number;
    isRepliesExpanded?: boolean;
    isRepliesLoading?: boolean;
    replies?: CommentWithMeta[];
    hasMoreReplies?: boolean;
    onLoadMoreReplies?: (commentId: string) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = memo(({
    comment,
    currentUser,
    loadingStates,
    onReply,
    onLike,
    onToggleReplies,
    depth,
    isRepliesExpanded = false,
    isRepliesLoading = false,
    replies = [],
    hasMoreReplies = false,
    onLoadMoreReplies
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxDepth = 3;

    useEffect(() => {
        if (showReplyForm && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [showReplyForm, replyContent]);


    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onReply(comment.id, replyContent.trim());
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleReplies = async () => {
        await onToggleReplies(comment.id);
    };

    const handleLoadMoreReplies = async () => {
        if (onLoadMoreReplies) {
            await onLoadMoreReplies(comment.id);
        }
    };

    return (
        <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}>
            <div className="flex gap-3 group">
                {/* Avatar */}
                <Avatar className="h-8 w-8 mt-1">
                    {comment.author_avatar ? (
                        <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                    ) : (
                        <AvatarFallback>{comment.author_name?.[0]?.toUpperCase()}</AvatarFallback>
                    )}
                </Avatar>
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 relative">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                                {comment.author_name}
                            </span>
                            {comment.author_role && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {comment.author_role}
                                </span>
                            )}
                            <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                            </span>
                        </div>
                        {/* Comment Text */}
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLike(comment.id)}
                            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${comment.is_liked ? 'text-red-500' : ''}`}
                            disabled={loadingStates[comment.id + '_like']}
                        >
                            <Heart className={`h-3 w-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                            <span>{comment.heart_count ?? 0}</span>
                        </Button>
                        {depth < maxDepth && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                            >
                                <Reply className="h-3 w-3" />
                                <span>Reply</span>
                            </Button>
                        )}
                    </div>

                    {/* Facebook-style View Replies Button */}
                    {(comment.replies_count && comment.replies_count > 0) && (
                        <div className="mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleReplies(comment.id)}
                                disabled={isRepliesLoading}
                                className={`flex items-center gap-1 transition-colors disabled:opacity-50 font-medium ${comment.showReplies
                                    ? 'text-gray-600 hover:text-gray-800'
                                    : 'text-blue-500 hover:text-blue-600'
                                    }`}
                            >
                                {isRepliesLoading ? (
                                    <div className="h-3 w-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <MessageCircle className="h-3 w-3" />
                                )}
                                <span>
                                    {comment.showReplies ? 'Hide' : 'View'} {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                                </span>
                                {comment.showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                    )}

                    {/* Test button for development */}
                    {process.env.NODE_ENV === 'development' && !comment.replies_count && (
                        <div className="mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleReplies(comment.id)}
                                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors font-medium"
                            >
                                <MessageCircle className="h-3 w-3" />
                                <span>Test: View replies (dev only)</span>
                            </Button>
                        </div>
                    )}

                    {/* Debug: Show reply count info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-1 text-xs text-gray-400">
                            Debug: replies_count={comment.replies_count}
                        </div>
                    )}
                    {/* Reply Form */}
                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="mt-3">
                            <div className="flex gap-2">
                                <Avatar className="h-7 w-7">
                                    {currentUser.avatar ? (
                                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                    ) : (
                                        <AvatarFallback>U</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1 relative">
                                    <Textarea
                                        ref={textareaRef}
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        placeholder={`Reply to ${comment.author_name}...`}
                                        rows={1}
                                        maxLength={500}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-400">{replyContent.length}/500</span>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setShowReplyForm(false);
                                                    setReplyContent('');
                                                }}
                                                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={!replyContent.trim() || isSubmitting}
                                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isSubmitting ? (
                                                    <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="h-3 w-3" />
                                                )}
                                                <span>Reply</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                    {/* Replies */}
                    {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUser={currentUser}
                                    loadingStates={loadingStates}
                                    onReply={onReply}
                                    onLike={onLike}
                                    onToggleReplies={onToggleReplies}
                                    depth={depth + 1}
                                    isRepliesExpanded={isRepliesExpanded}
                                    isRepliesLoading={isRepliesLoading}
                                    replies={replies}
                                    {...(onLoadMoreReplies && { onLoadMoreReplies })}
                                />
                            ))}
                            {/* Facebook-style "View more replies" Button */}
                            {hasMoreReplies && onLoadMoreReplies && (
                                <div className="ml-8 pl-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLoadMoreReplies}
                                        disabled={isRepliesLoading}
                                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors font-medium"
                                    >
                                        {isRepliesLoading ? (
                                            <div className="h-3 w-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <MessageCircle className="h-3 w-3" />
                                        )}
                                        <span>View more replies</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem; 