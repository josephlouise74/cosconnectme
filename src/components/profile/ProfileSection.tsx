"use client"

import { useParams } from "next/navigation"
import React, { useMemo } from "react"
import ProfileSkeletonBorrower from "./components/ProfileSkeletionBorrower"
import ProfileHeader from "./components/ProfileHeader"
import ProfileAboutCardBorrower from "./components/ProfileAboutCardBorrower"
import PostCreationCardBorrower from "./components/PostCreationCardBorrower"
import PostsListBorrower from "./components/PostListBorrower"
import ImageGalleryBorrower from "./components/ImageGalleryBorrower"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { UserRolesResponseData } from "@/lib/types/userType"

const ProfileSection = () => {
  const { username } = useParams()
  const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth()

  // Check if the user is viewing their own profile
  const isOwnProfile = useMemo(() => {
    return isAuthenticated && userRolesData?.personal_info?.username === username
  }, [isAuthenticated, userRolesData, username])

  // Use profile data from props or fallback to userRolesData
  const profileData = useMemo<UserRolesResponseData | null>(() => {
    if (!userRolesData) return null

    // Return a properly formatted profile data object
    return {
      ...userRolesData,
      // Ensure all required fields have proper fallbacks
      user_id: userRolesData.user_id || '',
      username: userRolesData.username || '',
      email: userRolesData.email || '',
      roles: userRolesData.roles || [],
      current_role: userRolesData.current_role || 'borrower',
      status: userRolesData.status || 'active',
      can_switch_roles: userRolesData.can_switch_roles || false,
      email_verified: userRolesData.email_verified || false,
      phone_verified: userRolesData.phone_verified || false,
      profile_image: userRolesData.profile_image || null,
      bio: userRolesData.bio || null,
      created_at: userRolesData.created_at || new Date().toISOString(),
      updated_at: userRolesData.updated_at || new Date().toISOString(),
      personal_info: {
        ...userRolesData.personal_info,
        username: userRolesData.personal_info?.username || userRolesData.username || '',
        email: userRolesData?.email || userRolesData.email || '',
      },
      identification_info: userRolesData.identification_info || {
        has_valid_documents: false,
        documents: []
      },
      address_information: userRolesData.address_information || {
        street: '',
        barangay: '',
        zip_code: '',
        country: 'Philippines',
        region: '',
        province: '',
        city: null
      }
    }
  }, [userRolesData])

  // Show loading state
  if (isLoading || !profileData) {
    return <ProfileSkeletonBorrower />
  }

  // If not authenticated, show error or redirect
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Please sign in to view profiles.</p>
      </div>
    )
  }

  // If viewing someone else's profile and we don't have their data
  if (!isOwnProfile && !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Profile not found or you don't have permission to view this profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header with Cover Photo and Avatar */}
      <ProfileHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileAboutCardBorrower
              profileData={profileData}
              isOwnProfile={isOwnProfile}
            />

            {/* Image Gallery */}
            <ImageGalleryBorrower />
          </div>

          {/* Right Column - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card - Only show if it's the user's own profile */}
            {isOwnProfile && (
              <PostCreationCardBorrower profileData={profileData} />
            )}

            {/* Posts List */}
            <PostsListBorrower profileData={profileData} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProfileSection)
