"use client"

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface CommentFormData {
    content: string
    images?: string[]
}

interface UseCommentsProps {
    postId: string
    initialComments?: any[]
    onComment?: ((postId: string, comment: CommentFormData) => Promise<void>) | undefined
    onCommentLike?: (commentId: string) => Promise<void>
    currentUser: any | undefined
}

export const useComments = ({
    postId,
    initialComments = [],
    onComment,
    onCommentLike,
    currentUser
}: UseCommentsProps) => {
    const [comments, setComments] = useState<any[]>(initialComments)
    const [isLoading, setIsLoading] = useState(false)

    const addComment = useCallback(async (any: CommentFormData) => {
        if (!onComment || !currentUser) return

        setIsLoading(true)
        try {
            await onComment(postId, any)
            // Optimistic update
            const now = new Date();
            const newComment: any = {
                id: Math.random().toString(36).substr(2, 9),
                postId,
                postAuthorId: {
                    id: '',
                    name: '',
                    avatar: '',
                    role: ''
                },
                commenter: {
                    userId: currentUser.uid,
                    username: currentUser.name,
                    userEmail: currentUser.email,
                    userAvatarUrl: currentUser.avatar
                },
                content: any.content,
                images: any.images || [],
                createdAt: {
                    _seconds: Math.floor(now.getTime() / 1000),
                    _nanoseconds: (now.getTime() % 1000) * 1e6
                },
                updatedAt: {
                    _seconds: Math.floor(now.getTime() / 1000),
                    _nanoseconds: (now.getTime() % 1000) * 1e6
                },
                isDeleted: false,
                likesCount: 0,
                repliesCount: 0
            }
            setComments(prev => [newComment, ...prev])
            toast.success('Comment posted successfully')
        } catch (error) {
            console.error('Failed to post comment:', error)
            toast.error('Failed to post comment')
        } finally {
            setIsLoading(false)
        }
    }, [postId, onComment, currentUser])

    const toggleCommentLike = useCallback(async (commentId: string) => {
        if (!onCommentLike) return

        try {
            await onCommentLike(commentId)
            // Optimistic update (just increment/decrement likesCount)
            setComments(prev => prev.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        likesCount: comment.likesCount + 1 // You may want to toggle or adjust logic as needed
                    }
                    : comment
            ))
        } catch (error) {
            console.error('Failed to like comment:', error)
            toast.error('Failed to like comment')
        }
    }, [onCommentLike])

    const updateComments = useCallback((newComments: any[]) => {
        setComments(newComments)
    }, [])

    return {
        comments,
        isLoading,
        addComment,
        toggleCommentLike,
        updateComments
    }
} 