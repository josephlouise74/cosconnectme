"use client"

import { useCallback, memo, useMemo, useReducer } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Upload, Camera } from 'lucide-react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { BorrowerUser } from '@/types/borrowerType'

interface PostCreationCardBorrowerProps {
    profileData: BorrowerUser | null
}

// Define action types
type PostAction =
    | { type: 'SET_DIALOG_OPEN'; payload: boolean }
    | { type: 'SET_POST_CONTENT'; payload: string }
    | { type: 'ADD_IMAGES'; payload: File[] }
    | { type: 'REMOVE_IMAGE'; payload: number }
    | { type: 'RESET_POST' }

// Define state type
interface PostState {
    isPostDialogOpen: boolean
    selectedImages: File[]
    postContent: string
}

// Initial state
const initialState: PostState = {
    isPostDialogOpen: false,
    selectedImages: [],
    postContent: ''
}

// Reducer function
function postReducer(state: PostState, action: PostAction): PostState {
    switch (action.type) {
        case 'SET_DIALOG_OPEN':
            return {
                ...state,
                isPostDialogOpen: action.payload
            }
        case 'SET_POST_CONTENT':
            return {
                ...state,
                postContent: action.payload
            }
        case 'ADD_IMAGES':
            return {
                ...state,
                selectedImages: [...state.selectedImages, ...action.payload]
            }
        case 'REMOVE_IMAGE':
            return {
                ...state,
                selectedImages: state.selectedImages.filter((_, i) => i !== action.payload)
            }
        case 'RESET_POST':
            return initialState
        default:
            return state
    }
}

const PostCreationCardBorrower = memo(({ profileData }: PostCreationCardBorrowerProps) => {
    const [state, dispatch] = useReducer(postReducer, initialState)

    // Get initials for avatar fallback
    const getInitials = useMemo(() => {
        if (!profileData?.username) return 'U'
        return profileData.username
            .split(' ')
            .map((name: string) => name[0])
            .join('')
            .toUpperCase()
    }, [profileData?.username])

    // Handle image selection for post upload
    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files)
            dispatch({ type: 'ADD_IMAGES', payload: filesArray })
        }
    }, [])

    // Handle post submission
    const handlePostSubmit = useCallback(() => {
        // Implementation for post submission would go here
        console.log('Submitting post:', { content: state.postContent, images: state.selectedImages })
        dispatch({ type: 'RESET_POST' })
    }, [state.postContent, state.selectedImages])

    // Remove selected image
    const removeImage = useCallback((index: number) => {
        dispatch({ type: 'REMOVE_IMAGE', payload: index })
    }, [])



    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <Dialog open={state.isPostDialogOpen} onOpenChange={(open) => dispatch({ type: 'SET_DIALOG_OPEN', payload: open })}>
                    <DialogTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <Avatar className="h-10 w-10">
                                {profileData?.avatar ? (
                                    <AvatarImage src={profileData.avatar} alt={profileData.username} />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                                        {getInitials}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                What's on your mind?
                            </div>
                        </div>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Create Post</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
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
                                <span className="font-medium">{profileData?.username || 'User'}</span>
                            </div>

                            <Textarea
                                placeholder="What's on your mind?"
                                className="min-h-[120px]"
                                value={state.postContent}
                                onChange={(e) => dispatch({ type: 'SET_POST_CONTENT', payload: e.target.value })}
                            />

                            <AnimatePresence>
                                {state.selectedImages.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        {state.selectedImages.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                className="relative rounded-md overflow-hidden h-24"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Image
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Selected image ${index}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ×
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>


                            <div className="flex items-center justify-between">
                                <label className="cursor-pointer">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                    <div className="flex items-center gap-2 text-rose-600 hover:text-rose-700">
                                        <Upload size={18} />
                                        <span>Add Photos</span>
                                    </div>
                                </label>

                                <Button
                                    onClick={handlePostSubmit}
                                    disabled={!state.postContent.trim() && state.selectedImages.length === 0}
                                >
                                    Post
                                </Button>
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