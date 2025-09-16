import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { uploadMultipleImages } from '@/utils/supabase/fileUpload'

import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, Send, X } from 'lucide-react'
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
    onComment: (postId: string, comment: { content: string; images?: string[] }) => Promise<void>
    onCommentLike: (commentId: string) => Promise<void>
    comments: any[]
    formatTimeAgo: (date: Date) => string
    checkAuthentication: () => boolean
}

// Skeleton component for post preview
const PostPreviewSkeleton = () => (
    <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center space-x-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-20 w-full mb-3" />
        <div className="flex space-x-2">
            {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-24 rounded-lg" />
            ))}
        </div>
    </div>
)

const CommentDialog: React.FC<CommentDialogProps> = ({
    post,
    isOpen,
    onClose,
    formatTimeAgo,
    checkAuthentication
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

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset, // <-- Add this
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
            }, 1000)
            return () => clearTimeout(timer)
        }

        return
    }, [isOpen])

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        // Check if adding new images would exceed the limit
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
                // Upload images to Supabase
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


            reset();
            setSelectedImages([]);
            setPreviewImages([]);
            onClose();
        } catch (error: any) {
            // Error toast is already handled in the hook, but you can add extra handling if needed
            // toast.error(error.message || 'Failed to post comment');
        } finally {
            setIsCommenting(false);
        }
    };


    const handleDialogClose = useCallback(() => {
        if (!isCommenting) {
            onClose()
        }
    }, [isCommenting, onClose])

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 cursor-pointer"
                        onClick={handleDialogClose}
                        disabled={isCommenting}
                        aria-label="Close dialog"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Original Post Preview */}
                    {isPostLoading ? (
                        <PostPreviewSkeleton />
                    ) : (
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback>
                                        {post.author.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{post.author.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatTimeAgo(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm mb-3 leading-relaxed">{post.content}</p>

                            {/* Optimized Post Images */}
                            {post.images && post.images.length > 0 && post.images[0] && (
                                <div className="flex justify-center items-center mb-2">
                                    <div className="w-full h-full rounded-lg overflow-hidden border">
                                        <Image
                                            src={post.images[0]}
                                            alt="Post image"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Comment Form */}
                <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="space-y-3">
                        {/* Reply User Avatar and Info */}
                        <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={replyAvatarUrl} alt={replyName} />
                                <AvatarFallback>{replyName.split(' ').map((n: any) => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-medium text-sm">{replyName}</span>
                                {isOwnPost && (
                                    <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">(You are replying to your own post)</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="comment-content" className="text-sm font-medium">
                                Your Reply
                            </Label>
                            <Textarea
                                id="comment-content"
                                {...register('content')}
                                placeholder="Write your reply..."
                                className="resize-none min-h-[100px] mt-1"
                                disabled={isCommenting}
                            />
                            {errors.content && (
                                <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                            )}
                        </div>

                        {/* Image Upload Loading State */}
                        {imagesLoading && (
                            <div className="grid grid-cols-3 gap-2">
                                {[...Array(2)].map((_, index) => (
                                    <Skeleton key={index} className="w-full h-20 rounded border" />
                                ))}
                            </div>
                        )}

                        {/* Image Previews */}
                        {previewImages.length > 0 && !imagesLoading && (
                            <div className="grid grid-cols-3 gap-2">
                                {previewImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={img}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border transition-all duration-200 group-hover:opacity-90"
                                            width={100}
                                            height={100}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={() => removeImage(index)}
                                            disabled={isCommenting}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center space-x-3">
                                <Label htmlFor="comment-images" className="cursor-pointer">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        disabled={isCommenting || imagesLoading || hasReachedImageLimit}
                                    >
                                        <span>
                                            {imagesLoading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 mr-2" />
                                            )}
                                            {imagesLoading ? 'Uploading...' : hasReachedImageLimit ? 'Max Images Reached' : 'Add Images'}
                                        </span>
                                    </Button>
                                </Label>
                                <div className='flex justify-center items-center'>
                                    <Input
                                        id="comment-images"
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isCommenting || imagesLoading || hasReachedImageLimit}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {selectedImages.length}/3 images • {watchedContent?.length || 0}/500
                                    </span>
                                </div>
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
                                className="min-w-[100px]"
                            >
                                {isCommenting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Post Reply
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CommentDialog