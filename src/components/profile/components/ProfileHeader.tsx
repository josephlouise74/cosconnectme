// ProfileHeader.tsx
"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BusinessResponse, UserResponse } from '@/lib/types/profile/get-profile-data'
import { motion } from 'framer-motion'
import {
    Building,
    Calendar,
    Camera,
    CheckCircle,
    Edit,
    Mail,
    MapPin,
    MessageCircle,
    Users,
    XCircle
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useReducer } from 'react'
// Import the SendMessageModal
import SendMessageModal from './SendMessageModal'; // Adjust the path if needed

// Import the types
// Define the processed profile data type
interface ProcessedProfileData {
    type: 'business' | 'user'
    business?: BusinessResponse['data']['business']
    user?: UserResponse['data']['user']
    personal?: UserResponse['data']['personal']
    metadata: {
        role: 'borrower' | 'lender'
        created_at: string
        updated_at: string
        has_business_info?: boolean
    }
}
interface ProfileHeaderProps {
    profileData: ProcessedProfileData
    role: 'borrower' | 'lender'
    isOwnProfile?: boolean
    onEditProfile?: () => void
    userRolesData?: any
}
// Define action types
type ProfileAction =
    | { type: 'SET_COVER_PHOTO'; payload: { file: File | null; preview: string | null } }
    | { type: 'SET_AVATAR'; payload: { file: File | null; preview: string | null } }
    | { type: 'TOGGLE_COVER_DIALOG'; payload: boolean }
    | { type: 'TOGGLE_AVATAR_DIALOG'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'TOGGLE_SEND_MESSAGE_DIALOG'; payload: boolean }
    | { type: 'RESET_STATE' }
// Define state type
interface ProfileState {
    isEditCoverOpen: boolean
    isEditAvatarOpen: boolean
    isSendMessageOpen: boolean
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
    isSendMessageOpen: false,
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
        case 'TOGGLE_SEND_MESSAGE_DIALOG':
            return {
                ...state,
                isSendMessageOpen: action.payload
            }
        case 'RESET_STATE':
            return initialState
        default:
            return state
    }
}
const ProfileHeader = ({
    profileData,
    role,
    isOwnProfile = false,
    onEditProfile,
    userRolesData
}: ProfileHeaderProps) => {
    const router = useRouter();
    const [state, dispatch] = useReducer(profileReducer, initialState)
    // Extract data based on profile type
    const getProfileInfo = () => {
        if (role === 'lender' && profileData.type === 'business' && profileData.business) {
            const { info } = profileData.business
            return {
                name: info.business_name,
                username: `@${info.business_name.toLowerCase().replace(/\s+/g, '_')}`,
                email: info.business_email,
                phone: info.business_phone_number,
                profileImage: info.business_profile_image,
                backgroundImage: info.business_background_image,
                bio: info.business_description,
                isVerified: info.verification?.is_verified,
                status: info.verification?.is_verified ? 'verified' : 'pending',
                joinDate: info.created_at,
                businessType: info.business_type,
                location: profileData.business?.addresses?.[0]?.full_address
            }
        } else if (role === 'borrower' && profileData.type === 'user' && profileData.user) {
            const { user } = profileData
            return {
                name: user.full_name,
                username: `@${user.username}`,
                email: user.email,
                phone: user.phone_number,
                profileImage: user.profile_image,
                backgroundImage: user.profile_background,
                bio: user.bio,
                isVerified: user.status === 'verified',
                status: user.status,
                joinDate: user.created_at,
                location: profileData.personal?.addresses?.[0]?.full_address
            }
        }
        return null
    }
    const profileInfo = getProfileInfo()
    // Get initials for avatar fallback
    const getInitials = () => {
        if (!profileInfo?.name) return 'U'
        return profileInfo.name
            .split(' ')
            .map((name: string) => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    // Updated handleMessageClick: Now opens the send message dialog
    const handleMessageClick = () => {
        dispatch({ type: 'TOGGLE_SEND_MESSAGE_DIALOG', payload: true })
    };

    console.log("userRolesData 2222", userRolesData)
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
    // Handle uploads
    const handleCoverPhotoUpload = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            console.log('Uploading cover photo:', state.coverPhotoFile)
            dispatch({ type: 'TOGGLE_COVER_DIALOG', payload: false })
        } catch (error) {
            console.error('Error uploading cover photo:', error)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.coverPhotoFile])
    const handleAvatarUpload = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            console.log('Uploading avatar:', state.avatarFile)
            dispatch({ type: 'TOGGLE_AVATAR_DIALOG', payload: false })
        } catch (error) {
            console.error('Error uploading avatar:', error)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.avatarFile])
    if (!profileInfo) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Profile information not available.
                </p>
            </div>
        )
    }
    return (
        <div className="w-full">
            {/* Cover Photo Section */}
            <div className='w-full h-96 relative'>
                <div className="max-w-6xl mx-auto h-96 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden rounded-lg relative">
                    {state.coverPhotoPreview ? (
                        <Image
                            src={state.coverPhotoPreview}
                            alt="Cover photo"
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : profileInfo.backgroundImage ? (
                        <Image
                            src={profileInfo.backgroundImage}
                            alt="Cover photo"
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera size={48} className="text-gray-400 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No cover photo added yet</p>
                        </div>
                    )}
                    {/* Cover Photo Edit Button */}
                    {isOwnProfile && (
                        <div className="absolute top-4 right-4">
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
                    <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between py-6 border-b border-gray-200 dark:border-gray-700 gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center relative">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative"
                                >
                                    <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-800 shadow-lg">
                                        <AvatarImage
                                            src={state.avatarPreview || profileInfo.profileImage || ''}
                                            alt={profileInfo.name}
                                        />
                                        <AvatarFallback className="text-4xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Avatar Edit Button */}
                                    {isOwnProfile && (
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
                            {/* Name and Info */}
                            <div className="text-center md:text-left space-y-3">
                                {/* Name and Verification */}
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {profileInfo.name}
                                    </h1>
                                    {profileInfo.isVerified && (
                                        <CheckCircle className="h-6 w-6 text-blue-500" />
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    {profileInfo.username}
                                </p>
                                {/* Role and Business Type Badges */}
                                <div className="flex justify-center md:justify-start items-center gap-2 flex-wrap">
                                    <Badge
                                        variant={role === 'lender' ? 'default' : 'secondary'}
                                        className="flex items-center gap-1"
                                    >
                                        {role === 'lender' ? <Building className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                        {role === 'lender' ? 'Business' : 'Individual'}
                                    </Badge>
                                    {role === 'lender' && profileInfo.businessType && (
                                        <Badge variant="outline">
                                            {profileInfo.businessType}
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={profileInfo.isVerified ? 'default' : 'destructive'}
                                        className="flex items-center gap-1"
                                    >
                                        {profileInfo.isVerified ? (
                                            <CheckCircle className="h-3 w-3" />
                                        ) : (
                                            <XCircle className="h-3 w-3" />
                                        )}
                                        {profileInfo.status}
                                    </Badge>
                                </div>
                                {/* Contact Info */}
                                <div className="flex justify-center md:justify-start items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {profileInfo.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            <span className="hidden sm:inline">{profileInfo.email}</span>
                                        </div>
                                    )}
                                    {profileInfo.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span className="hidden sm:inline truncate max-w-48">
                                                {profileInfo.location}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined {new Date(profileInfo.joinDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {/* Bio */}
                                {profileInfo.bio && (
                                    <p className="text-gray-700 dark:text-gray-300 max-w-md text-center md:text-left">
                                        {profileInfo.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap justify-center">
                            {isOwnProfile ? (
                                // Edit Profile Button for own profile
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={onEditProfile}
                                >
                                    <Edit size={16} />
                                    Edit Profile
                                </Button>
                            ) : (
                                <>

                                    {/* Message Button */}
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={handleMessageClick}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Cover Photo Upload Dialog */}
            {isOwnProfile && (
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
            {isOwnProfile && (
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
            {/* Send Message Dialog */}
            {!isOwnProfile && (
                <SendMessageModal
                    isOpen={state.isSendMessageOpen}
                    onClose={() => dispatch({ type: 'TOGGLE_SEND_MESSAGE_DIALOG', payload: false })}
                    recipientName={profileInfo.name}
                    recipientUsername={profileData.user?.username || ''}
                    recipientId={profileData.user?.id || ''}
                    senderId={userRolesData?.user_id || ''}
                    senderUsername={userRolesData?.username || ''}
                />
            )}
        </div>
    )
}
export default ProfileHeader