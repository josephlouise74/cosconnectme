import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Comment, useCommentOnPost, useGetCommentsOnPost } from '@/lib/api/communityApi'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { uploadMultipleImages } from '@/utils/supabase/fileUpload'

import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, MessageCircle, Send, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Comment schema
const commentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
    images: z.array(z.string()).max(3, "Maximum 3 images allowed").optional()
})

type CommentFormData = z.infer<typeof commentSchema>

interface CommentDialogProps {
    post: any
    isOpen: boolean
    onClose: () => void
    formatTimeAgo: (date: Date) => string
    checkAuthentication: () => boolean
    refetch?: any
}

const CommentDialog: React.FC<CommentDialogProps> = ({
    post,
    isOpen,
    onClose,
    formatTimeAgo,
    checkAuthentication,
    refetch
}) => {
    const [isCommenting, setIsCommenting] = useState(false)
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [imagesLoading, setImagesLoading] = useState(false)
    const [isPostLoading, setIsPostLoading] = useState(true)
    const { userRolesData } = useSupabaseAuth();

    // Check if the current user is the author of the post
    const isOwnPost = userRolesData && post?.author?.id && userRolesData.user_id === post.author.id;
    const replyAvatarUrl = userRolesData?.personal_info?.profile_image || '';
    const replyName = userRolesData?.personal_info?.full_name || userRolesData?.username || 'You';

    const { commentOnPost } = useCommentOnPost()
    const {
        comments,
        isLoading: commentsLoading,
        refetch: refetchComments
    } = useGetCommentsOnPost({ post_id: post.id })

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid }
    } = useForm<CommentFormData>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: '',
            images: []
        }
    })

    const watchedContent = watch('content')
    const hasReachedImageLimit = selectedImages.length >= 3

    // Simulate post loading
    useEffect(() => {
        if (isOpen) {
            setIsPostLoading(true)
            const timer = setTimeout(() => {
                setIsPostLoading(false)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        if (selectedImages.length + files.length > 3) {
            toast.error("Maximum 3 images allowed")
            return
        }

        setImagesLoading(true)
        const newPreviews: string[] = []

        try {
            const imagePromises = Array.from(files).map(file => {
                return new Promise<void>((resolve, reject) => {
                    if (!file.type.startsWith('image/')) {
                        resolve()
                        return
                    }

                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const result = e.target?.result as string
                        if (result) {
                            newPreviews.push(result)
                        }
                        resolve()
                    }
                    reader.onerror = () => reject(new Error('Failed to read file'))
                    reader.readAsDataURL(file)
                })
            })

            await Promise.all(imagePromises)

            if (newPreviews.length > 0) {
                const uploadResult = await uploadMultipleImages(
                    Array.from(files).filter(file => file.type.startsWith('image/'))
                )

                if (uploadResult.allSuccessful) {
                    const uploadedUrls = uploadResult.successful.map((result: any) => result.url as string)
                    setPreviewImages(prev => [...prev, ...newPreviews])
                    setSelectedImages(prev => [...prev, ...uploadedUrls])
                    setValue('images', [...selectedImages, ...uploadedUrls])
                } else {
                    toast.error("Failed to upload some images")
                }
            }
        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Failed to upload some images')
        } finally {
            setImagesLoading(false)
        }
    }, [selectedImages, setValue])

    const removeImage = useCallback((index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index)
        const newPreviews = previewImages.filter((_, i) => i !== index)
        setSelectedImages(newImages)
        setPreviewImages(newPreviews)
        setValue('images', newImages)
    }, [selectedImages, previewImages, setValue])

    const onSubmit = async (data: CommentFormData) => {
        const borrower = userRolesData;
        if (!checkAuthentication() || isCommenting || !borrower) return;

        setIsCommenting(true);
        try {
            const payload = {
                post_id: post.id,
                parent_comment_id: null,
                commenter: {
                    user_id: borrower.user_id,
                    username: borrower.username,
                    user_avatar_url: borrower.personal_info?.profile_image || ''
                },
                comment: {
                    content: data.content,
                    images: data.images || []
                }
            };

            await commentOnPost(payload)
            refetch?.()
            refetchComments()
            reset();
            setSelectedImages([]);
            setPreviewImages([]);
            toast.success('Comment posted successfully!')
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to post comment');
        } finally {
            setIsCommenting(false);
        }
    };

    const handleDialogClose = useCallback(() => {
        if (!isCommenting) {
            onClose()
        }
    }, [isCommenting, onClose])

    const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
        <div className="flex space-x-3 py-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                <AvatarFallback className="text-xs">
                    {comment.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                        {comment.author_id === post.author.id && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                Author
                            </span>
                        )}
                        {comment.author_role && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                {comment.author_role}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

                    {comment.images && comment.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {comment.images.map((img, idx) => (
                                <div key={idx} className="rounded-lg overflow-hidden">
                                    <Image
                                        src={img}
                                        alt={`Comment image ${idx + 1}`}
                                        width={150}
                                        height={150}
                                        className="w-full h-24 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* <div className="flex items-center space-x-4 mt-1 ml-3">
                        <span className="text-xs text-gray-500">
                            {formatTimeAgo(new Date(comment.created_at))}
                        </span>
                    <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                        Like
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                        Reply
                    </button>
                    {parseInt(comment.reply_count) > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                            {comment.reply_count} {parseInt(comment.reply_count) === 1 ? 'reply' : 'replies'}
                        </span>
                    )}
                </div> */}
            </div>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-h-[90vh] p-0 overflow-hidden" size="full">


                <div className="flex h-[calc(90vh-80px)]">
                    {/* Left Side - Post Image */}
                    <div className="w-1/2 bg-black flex items-center justify-center border-r">
                        {isPostLoading ? (
                            <Skeleton className="w-full h-full" />
                        ) : post.images && post.images.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                    src={post.images[0]}
                                    alt="Post image"
                                    width={600}
                                    height={600}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
                                <MessageCircle size={64} />
                                <p className="text-lg">No image in this post</p>
                                <p className="text-sm text-center px-8">
                                    This post contains only text content
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Comments and Form */}
                    <div className="w-1/2 flex flex-col">
                        {/* Post Info Header */}
                        <div className="p-4 border-b bg-white">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback>
                                        {post.author.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{post.author.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatTimeAgo(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {post.content && (
                                <p className="text-sm mt-3 leading-relaxed text-gray-700">
                                    {post.content}
                                </p>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-4">
                                {commentsLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex space-x-3">
                                                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-16 w-full rounded-2xl" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="space-y-1">
                                        {comments.map((comment) => (
                                            <CommentItem key={comment.id} comment={comment} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>No comments yet</p>
                                        <p className="text-sm">Be the first to comment!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comment Form */}
                        <div className="border-t bg-white p-4">
                            <div className="space-y-3">

                                {/* Comment Input */}
                                <div className="flex space-x-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={replyAvatarUrl} alt={replyName} />
                                        <AvatarFallback className="text-xs">
                                            {replyName.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            {...register('content')}
                                            placeholder={isOwnPost ? "Reply to your post..." : "Write a comment..."}
                                            className="resize-none min-h-[60px] rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            disabled={isCommenting}
                                        />
                                        {errors.content && (
                                            <p className="text-sm text-red-500">{errors.content.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Image Previews */}
                                {imagesLoading && (
                                    <div className="flex space-x-2 ml-11">
                                        {[...Array(2)].map((_, index) => (
                                            <Skeleton key={index} className="w-16 h-16 rounded-lg" />
                                        ))}
                                    </div>
                                )}

                                {previewImages.length > 0 && !imagesLoading && (
                                    <div className="flex space-x-2 ml-11">
                                        {previewImages.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                    src={img}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-16 h-16 object-cover rounded-lg border"
                                                    width={64}
                                                    height={64}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeImage(index)}
                                                    disabled={isCommenting}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between ml-11">
                                    <div className="flex items-center space-x-3">
                                        <Label htmlFor="comment-images" className="cursor-pointer">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                disabled={isCommenting || imagesLoading || hasReachedImageLimit}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <span>
                                                    {imagesLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <ImageIcon className="h-4 w-4" />
                                                    )}
                                                </span>
                                            </Button>
                                        </Label>
                                        <Input
                                            id="comment-images"
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={isCommenting || imagesLoading || hasReachedImageLimit}
                                        />
                                        <span className="text-xs text-gray-500">
                                            {selectedImages.length}/3 • {watchedContent?.length || 0}/500
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={
                                            !isValid ||
                                            isCommenting ||
                                            !watchedContent?.trim() ||
                                            imagesLoading
                                        }
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isCommenting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Post
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CommentDialog