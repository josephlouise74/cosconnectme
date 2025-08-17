"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserRolesResponseData } from '@/lib/types/userType'
import { AnimatePresence, motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import { memo, useCallback, useMemo, useReducer } from 'react'

interface PostCreationCardBorrowerProps {
    profileData: UserRolesResponseData | null
}

type PostAction =
    | { type: 'SET_DIALOG_OPEN'; payload: boolean }
    | { type: 'SET_POST_CONTENT'; payload: string }
    | { type: 'ADD_IMAGES'; payload: File[] }
    | { type: 'REMOVE_IMAGE'; payload: number }
    | { type: 'RESET_POST' }
    | { type: 'SET_SUBMITTING'; payload: boolean }

interface PostState {
    isPostDialogOpen: boolean
    selectedImages: File[]
    postContent: string
    isSubmitting: boolean
}

const initialState: PostState = {
    isPostDialogOpen: false,
    selectedImages: [],
    postContent: '',
    isSubmitting: false
}

function postReducer(state: PostState, action: PostAction): PostState {
    switch (action.type) {
        case 'SET_DIALOG_OPEN':
            return { ...state, isPostDialogOpen: action.payload }
        case 'SET_POST_CONTENT':
            return { ...state, postContent: action.payload }
        case 'ADD_IMAGES':
            return { ...state, selectedImages: [...state.selectedImages, ...action.payload] }
        case 'REMOVE_IMAGE':
            return { ...state, selectedImages: state.selectedImages.filter((_, i) => i !== action.payload) }
        case 'RESET_POST':
            return { ...initialState, isPostDialogOpen: false }
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload }
        default:
            return state
    }
}

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const PostCreationCardBorrower = memo(({ profileData }: PostCreationCardBorrowerProps) => {
    const [state, dispatch] = useReducer(postReducer, initialState)

    const getInitials = useMemo(() => {
        if (!profileData?.personal_info?.full_name) return 'U'
        return profileData.personal_info.full_name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
    }, [profileData?.personal_info?.full_name])

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return

        const files = Array.from(e.target.files)
        const validFiles: File[] = []

        files.forEach(file => {
            if (file.size > MAX_IMAGE_SIZE) {
                console.warn(`File ${file.name} is too large. Max size is 5MB.`)
                return
            }
            if (state.selectedImages.length + validFiles.length >= MAX_IMAGES) {
                console.warn(`Maximum ${MAX_IMAGES} images allowed.`)
                return
            }
            validFiles.push(file)
        })

        if (validFiles.length > 0) {
            dispatch({ type: 'ADD_IMAGES', payload: validFiles })
        }
    }, [state.selectedImages.length])

    const handlePostSubmit = useCallback(async () => {
        if ((!state.postContent.trim() && state.selectedImages.length === 0) || state.isSubmitting) return

        dispatch({ type: 'SET_SUBMITTING', payload: true })

        try {
            // TODO: Implement actual post submission
            console.log('Submitting post:', {
                content: state.postContent,
                images: state.selectedImages
            })

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Reset form on success
            dispatch({ type: 'RESET_POST' })
        } catch (error) {
            console.error('Failed to create post:', error)
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false })
        }
    }, [state.postContent, state.selectedImages, state.isSubmitting])

    const removeImage = useCallback((index: number) => {
        dispatch({ type: 'REMOVE_IMAGE', payload: index })
    }, [])

    const avatarUrl = profileData?.personal_info?.profile_image || profileData?.profile_image
    const displayName = profileData?.personal_info?.full_name || profileData?.username || 'User'

    return (
        <Card className="mb-6 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
                <Dialog
                    open={state.isPostDialogOpen}
                    onOpenChange={(open) => dispatch({ type: 'SET_DIALOG_OPEN', payload: open })}
                >
                    <DialogTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <Avatar className="h-10 w-10">
                                {avatarUrl ? (
                                    <AvatarImage
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                                        {getInitials}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                What's on your mind, {profileData?.personal_info?.first_name || 'there'}?
                            </div>
                        </div>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">Create Post</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    {avatarUrl ? (
                                        <AvatarImage
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs">
                                            {getInitials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <div className="font-medium">{displayName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {profileData?.personal_info?.bio || 'Member'}
                                    </div>
                                </div>
                            </div>

                            <Textarea
                                placeholder="What's on your mind?"
                                className="min-h-[120px] text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none"
                                value={state.postContent}
                                onChange={(e) => dispatch({ type: 'SET_POST_CONTENT', payload: e.target.value })}
                            />

                            <AnimatePresence>
                                {state.selectedImages.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {state.selectedImages.map((image, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Selected ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeImage(index)
                                                        }}
                                                    >
                                                        ×
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <div className="flex items-center justify-between">
                                    <label className="cursor-pointer flex items-center gap-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors">
                                        <Upload size={18} />
                                        <span className="text-sm font-medium">
                                            {state.selectedImages.length > 0
                                                ? `Add more (${MAX_IMAGES - state.selectedImages.length} left)`
                                                : 'Add Photos'}
                                        </span>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageSelect}
                                            disabled={state.selectedImages.length >= MAX_IMAGES}
                                        />
                                    </label>

                                    <Button
                                        onClick={handlePostSubmit}
                                        disabled={(!state.postContent.trim() && state.selectedImages.length === 0) || state.isSubmitting}
                                        className="px-6"
                                    >
                                        {state.isSubmitting ? 'Posting...' : 'Post'}
                                    </Button>
                                </div>

                                {state.selectedImages.length > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {state.selectedImages.length} of {MAX_IMAGES} photos selected
                                    </p>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
})

PostCreationCardBorrower.displayName = 'PostCreationCardBorrower'

export default PostCreationCardBorrower