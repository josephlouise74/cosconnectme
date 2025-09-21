// ProfileSection.tsx
"use client"

import { useParams, useSearchParams } from "next/navigation"
import React, { useMemo } from "react"
import ProfileSkeletonBorrower from "./components/ProfileSkeletionBorrower"
import ProfileHeader from "./components/ProfileHeader"

import PostCreationCardBorrower from "./components/PostCreationCardBorrower"
import PostsListBorrower from "./components/PostListBorrower"
import ImageGalleryBorrower from "./components/ImageGalleryBorrower"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { useGetUserDataByIdWithRole } from "@/lib/api/userApi"
import { BusinessResponse, UserResponse } from "@/lib/types/profile/get-profile-data"
import ProfileAboutCard from "./components/ProfileAboutCardBorrower"

const ProfileSection = () => {
  const { username } = useParams()
  const searchParams = useSearchParams()
  const { isAuthenticated, userRolesData, isLoading: authLoading } = useSupabaseAuth()

  // Get role from URL search params
  const role = useMemo(() => {
    const roleParam = searchParams.get('role')

    // If role is not in the URL, check if there are any search params at all
    if (!roleParam) {
      const firstKey = searchParams.keys().next().value
      if (firstKey === 'borrower' || firstKey === 'lender') {
        return firstKey as 'borrower' | 'lender'
      }
    }

    return roleParam as 'borrower' | 'lender' || 'borrower' // default to borrower
  }, [searchParams])

  // Get author_id from URL query parameters
  const authorId = searchParams.get('id') || ''
  console.log("authorId from URL:", authorId)

  // Fetch profile data based on author_id and role
  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: profileError,
    error
  } = useGetUserDataByIdWithRole(authorId, role)

  // Check if the user is viewing their own profile
  const isOwnProfile = useMemo(() => {
    return isAuthenticated && userRolesData?.personal_info?.username === username
  }, [isAuthenticated, userRolesData, username])

  // Process profile data based on response type
  const processedProfileData = useMemo(() => {
    if (!profileResponse) return null

    if (role === 'lender' && 'business' in profileResponse.data) {
      const businessData = profileResponse.data as BusinessResponse['data']
      return {
        type: 'business' as const,
        business: businessData.business,
        metadata: businessData.metadata
      }
    } else if (role === 'borrower' && 'user' in profileResponse.data) {
      const userData = profileResponse.data as UserResponse['data']
      return {
        type: 'user' as const,
        user: userData.user,
        personal: userData.personal,
        metadata: userData.metadata
      }
    }

    return null
  }, [profileResponse, role])

  const isLoading = authLoading || profileLoading

  // Show loading state
  if (isLoading) {
    return <ProfileSkeletonBorrower />
  }

  // Handle errors
  if (profileError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load profile</p>
          <p className="text-gray-500 text-sm">{error?.message || 'An error occurred'}</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show error
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Please sign in to view profiles.</p>
      </div>
    )
  }

  // If no profile data available
  if (!processedProfileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Profile not found or you don't have permission to view this profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Profile Header with Cover Photo and Avatar */}
      <ProfileHeader
        profileData={processedProfileData as any}
        role={role}

      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileAboutCard
              profileData={processedProfileData}
              role={role}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Right Column - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card - Only show if it's the user's own profile */}
            {/*   {isOwnProfile && (
                <PostCreationCardBorrower profileData={processedProfileData} />
              )} */}

            {/* Posts List */}
            {/*  <PostsListBorrower profileData={processedProfileData} /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProfileSection)