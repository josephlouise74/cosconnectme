"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { motion } from 'framer-motion'
import { Camera, Edit, Users, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useReducer, useState } from 'react'
import { Card, CardHeader, CardContent, CardAction } from '@/components/ui/card'

import { ProfileFormBorrowerValues } from '@/lib/zodFormSchema/borrowerSchema'
import EditProfileBorrowerDialogSection, { mapUserRolesDataToProfileFormBorrowerValues } from '../EditProfileBorrowerDialogSection'

// Define action types
type ProfileAction =
    | { type: 'SET_COVER_PHOTO'; payload: { file: File | null; preview: string | null } }
    | { type: 'SET_AVATAR'; payload: { file: File | null; preview: string | null } }
    | { type: 'TOGGLE_COVER_DIALOG'; payload: boolean }
    | { type: 'TOGGLE_AVATAR_DIALOG'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'RESET_STATE' }

// Define state type
interface ProfileState {
    isEditCoverOpen: boolean
    isEditAvatarOpen: boolean
    coverPhotoFile: File | null
    avatarFile: File | null
    coverPhotoPreview: string | null
    avatarPreview: string | null
    isLoading: boolean
}

// Initial state
const initialState: ProfileState = {
    isEditCoverOpen: false,
    isEditAvatarOpen: false,
    coverPhotoFile: null,
    avatarFile: null,
    coverPhotoPreview: null,
    avatarPreview: null,
    isLoading: false
}

// Reducer function
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
    switch (action.type) {
        case 'SET_COVER_PHOTO':
            return {
                ...state,
                coverPhotoFile: action.payload.file,
                coverPhotoPreview: action.payload.preview
            }
        case 'SET_AVATAR':
            return {
                ...state,
                avatarFile: action.payload.file,
                avatarPreview: action.payload.preview
            }
        case 'TOGGLE_COVER_DIALOG':
            return {
                ...state,
                isEditCoverOpen: action.payload
            }
        case 'TOGGLE_AVATAR_DIALOG':
            return {
                ...state,
                isEditAvatarOpen: action.payload
            }
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            }
        case 'RESET_STATE':
            return initialState
        default:
            return state
    }
}

const ProfileHeader = () => {
    const [state, dispatch] = useReducer(profileReducer, initialState)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(1234) // This would come from your API
    const [followingCount, setFollowingCount] = useState(567) // This would come from your API

    const { username: urlUsername } = useParams()
    const { isAuthenticated, userRolesData } = useSupabaseAuth()

    // Check if the user is viewing their own profile
    const isOwnProfile = useMemo(() => {
        return isAuthenticated && userRolesData?.personal_info?.username === urlUsername;
    }, [isAuthenticated, userRolesData, urlUsername]);

    // Check if the current user is a borrower
    const isBorrower = useMemo(() => {
        return userRolesData?.current_role === 'borrower';
    }, [userRolesData]);

    // Check if the profile being viewed belongs to a borrower
    const isViewingBorrowerProfile = useMemo(() => {
        return userRolesData?.roles?.includes('borrower');
    }, [userRolesData]);

    // Get initials for avatar fallback
    const getInitials = useMemo(() => {
        if (!userRolesData?.personal_info?.username) return 'U'
        return userRolesData.personal_info.username
            .split(' ')
            .map((name: string) => name[0])
            .join('')
            .toUpperCase()
    }, [userRolesData?.personal_info?.username])

    // Handle follow/unfollow
    const handleFollowToggle = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })

            // Your follow/unfollow API call would go here
            // await followUser(urlUsername) or await unfollowUser(urlUsername)

            setIsFollowing(prev => !prev)
            setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1)

            console.log(isFollowing ? 'Unfollowed user' : 'Followed user')
        } catch (error) {
            console.error('Error toggling follow:', error)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [isFollowing, urlUsername])

    // Handle cover photo selection
    const handleCoverPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const preview = URL.createObjectURL(file)
            dispatch({
                type: 'SET_COVER_PHOTO',
                payload: { file, preview }
            })
        }
    }, [])

    // Handle avatar selection
    const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const preview = URL.createObjectURL(file)
            dispatch({
                type: 'SET_AVATAR',
                payload: { file, preview }
            })
        }
    }, [])

    // Handle cover photo upload
    const handleCoverPhotoUpload = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            // Implementation for cover photo upload would go here
            console.log('Uploading cover photo:', state.coverPhotoFile)
            dispatch({ type: 'TOGGLE_COVER_DIALOG', payload: false })
        } catch (error) {
            console.error('Error uploading cover photo:', error)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.coverPhotoFile])

    // Handle avatar upload
    const handleAvatarUpload = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            // Implementation for avatar upload would go here
            console.log('Uploading avatar:', state.avatarFile)
            dispatch({ type: 'TOGGLE_AVATAR_DIALOG', payload: false })
        } catch (error) {
            console.error('Error uploading avatar:', error)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.avatarFile])

    // Only show edit button if user is viewing their own profile and is a borrower and userRolesData exists
    const showEditProfile = isOwnProfile && isBorrower && !!userRolesData;
    const profileFormValues: ProfileFormBorrowerValues | null = userRolesData ? mapUserRolesDataToProfileFormBorrowerValues(userRolesData) : null;

    // If not viewing a borrower profile, show message
    if (!isViewingBorrowerProfile) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    This profile is not available or belongs to a different user type.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Cover Photo Section */}
            <div className='w-full h-96'>
                <div className="max-w-6xl mx-auto h-96 bg-gradient-to-br  from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden rounded-lg">
                    {state.coverPhotoPreview ? (
                        <Image
                            src={state.coverPhotoPreview}
                            alt="Cover photo"
                            width={1200}
                            height={400}
                            className="w-full h-full object-cover"
                            priority
                        />
                    ) : userRolesData?.personal_info?.profile_background ? (
                        <Image
                            src={userRolesData.personal_info.profile_background}
                            alt="Cover photo"
                            width={1200}
                            height={400}
                            className="w-full h-full object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera size={48} className="text-gray-400 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No cover photo added yet</p>
                        </div>
                    )}

                    {/* Cover Photo Edit Button */}
                    {isOwnProfile && isBorrower && (
                        <div className="flex justify-end p-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                                onClick={() => dispatch({ type: 'TOGGLE_COVER_DIALOG', payload: true })}
                            >
                                <Camera size={16} />
                                <span>Edit Cover</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Info Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col">
                    {/* Avatar and Action Buttons Row */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-4 sm:mb-0">
                            {/* Avatar */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative"
                                >
                                    <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-800 shadow-lg">
                                        {(userRolesData?.personal_info?.profile_image || state.avatarPreview) ? (
                                            <AvatarImage
                                                src={state.avatarPreview || userRolesData?.personal_info?.profile_image || ''}
                                                alt={userRolesData?.personal_info?.username || 'User'}
                                            />
                                        ) : (
                                            <AvatarFallback className="text-4xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                                                {getInitials}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    {/* Avatar Edit Button */}
                                    {isOwnProfile && isBorrower && (
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute bottom-2 right-2 rounded-full h-10 w-10 bg-white dark:bg-gray-800 shadow-md"
                                            onClick={() => dispatch({ type: 'TOGGLE_AVATAR_DIALOG', payload: true })}
                                        >
                                            <Camera size={16} />
                                        </Button>
                                    )}
                                </motion.div>
                            </div>

                            {/* Name and Stats */}
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {userRolesData?.personal_info?.full_name || userRolesData?.personal_info?.username || 'User'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
                                    @{userRolesData?.personal_info?.username}
                                </p>

                                {/* Role Badge */}
                                <div className="flex justify-center sm:justify-start items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {userRolesData?.current_role || 'User'}
                                    </span>
                                </div>

                                {/* Followers/Following Stats */}
                                <div className="flex justify-center sm:justify-start items-center gap-6 mt-4">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {followersCount.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Followers
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {followingCount.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Following
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {isOwnProfile ? (
                                // Edit Profile Button for own profile
                                showEditProfile && profileFormValues && (
                                    <EditProfileBorrowerDialogSection
                                        profileData={profileFormValues}
                                        trigger={
                                            <Button variant="outline" className="flex items-center gap-2">
                                                <Edit size={16} />
                                                Edit Profile
                                            </Button>
                                        }
                                        onProfileUpdate={async (updatedData) => {
                                            console.log('Profile updated:', updatedData);
                                        }}
                                    />
                                )
                            ) : (
                                // Follow/Unfollow Button for other profiles
                                <Button
                                    onClick={handleFollowToggle}
                                    disabled={state.isLoading}
                                    className={`flex items-center gap-2 min-w-[120px] ${isFollowing
                                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    variant={isFollowing ? "secondary" : "default"}
                                >
                                    {isFollowing ? (
                                        <>
                                            <Users size={16} />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} />
                                            Follow
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Message Button (for non-own profiles) */}
                            {!isOwnProfile && (
                                <Button variant="outline" className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Message
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Photo Upload Dialog */}
            {isOwnProfile && isBorrower && (
                <Dialog open={state.isEditCoverOpen} onOpenChange={(open) => dispatch({ type: 'TOGGLE_COVER_DIALOG', payload: open })}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Update Cover Photo</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            {state.coverPhotoPreview && (
                                <div className="w-full h-48 rounded-md overflow-hidden">
                                    <Image
                                        src={state.coverPhotoPreview}
                                        alt="Cover photo preview"
                                        width={500}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="cursor-pointer">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleCoverPhotoSelect}
                                    />
                                    <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        <Camera size={18} />
                                        <span>Select Image</span>
                                    </div>
                                </label>

                                <Button
                                    onClick={handleCoverPhotoUpload}
                                    disabled={!state.coverPhotoFile || state.isLoading}
                                >
                                    {state.isLoading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Avatar Upload Dialog */}
            {isOwnProfile && isBorrower && (
                <Dialog open={state.isEditAvatarOpen} onOpenChange={(open) => dispatch({ type: 'TOGGLE_AVATAR_DIALOG', payload: open })}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Update Profile Picture</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            {state.avatarPreview && (
                                <div className="flex justify-center">
                                    <div className="h-36 w-36 rounded-full overflow-hidden">
                                        <Image
                                            src={state.avatarPreview}
                                            alt="Avatar preview"
                                            width={144}
                                            height={144}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="cursor-pointer">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarSelect}
                                    />
                                    <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        <Camera size={18} />
                                        <span>Select Image</span>
                                    </div>
                                </label>

                                <Button
                                    onClick={handleAvatarUpload}
                                    disabled={!state.avatarFile || state.isLoading}
                                >
                                    {state.isLoading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default ProfileHeader