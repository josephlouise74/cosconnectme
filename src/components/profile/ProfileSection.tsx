"use client"

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { useParams } from 'next/navigation'
import React, { useMemo } from 'react'
import ProfileSkeletonBorrower from './components/ProfileSkeletionBorrower'
import ProfileHeader from './components/ProfileHeader'
import ProfileAboutCardBorrower from './components/ProfileAboutCardBorrower'

import PostCreationCardBorrower from './components/PostCreationCardBorrower'
import PostsListBorrower from './components/PostListBorrower'
import ImageGalleryBorrower from './components/ImageGalleryBorrower'

// ProfileData type based on userRolesDataType
export type ProfileData = {
  uid?: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  middle_name?: string | null;
  email: string;
  phone_number?: string | undefined;
  bio?: string;
  street?: string;
  barangay?: string;
  zip_code?: string;
  country?: string;
  region?: string;
  province?: string;
  city?: { id: string; name: string };
  profile_image?: string | null;
  avatar?: string | null;
  role?: string[];
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'verified' | 'rejected';
  created_at?: string;
  address?: string | null;
}

const ProfileSection = () => {
  const { username } = useParams()
  const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();

  // Check if the user is viewing their own profile
  const isOwnProfile = useMemo(() => {
    return isAuthenticated && userRolesData?.personal_info?.username === username;
  }, [isAuthenticated, userRolesData, username]);

  // Memoized profile data to prevent unnecessary re-renders
  const profileData = useMemo<ProfileData | null>(() => {
    if (!userRolesData) return null;

    // If viewing own profile, use userRolesData
    if (isOwnProfile) {
      return {
        uid: userRolesData.user_id,
        username: userRolesData.personal_info.username,
        first_name: userRolesData.personal_info.first_name,
        last_name: userRolesData.personal_info.last_name,
        full_name: userRolesData.personal_info.full_name,
        middle_name: userRolesData.personal_info.middle_name || null,
        email: userRolesData.email || "",
        phone_number: userRolesData.personal_info.phone_number || undefined,
        bio: '', // Add bio if available in userRolesData
        street: userRolesData.address_information.street,
        barangay: userRolesData.address_information.barangay,
        zip_code: userRolesData.address_information.zip_code,
        country: userRolesData.address_information.country,
        region: userRolesData.address_information.region,
        province: userRolesData.address_information.province,
        city: userRolesData.address_information.city,
        profile_image: userRolesData.personal_info.profile_image || null,
        avatar: null, // If you have a separate avatar field, map it here
        role: userRolesData.roles,
        status: userRolesData.status,
        created_at: '', // If you have created_at, map it here
        address: `${userRolesData.address_information.street}, ${userRolesData.address_information.barangay}, ${userRolesData.address_information.city?.name || ''}, ${userRolesData.address_information.province}, ${userRolesData.address_information.region}`,
      };
    }

    // If viewing someone else's profile, you might need to fetch their data
    // For now, return null as we don't have the API for other users
    return null;
  }, [userRolesData, isOwnProfile]);

  if (isLoading) {
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

  // If no profile data available
  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Profile data not available.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header with Cover Photo and Avatar */}
      <ProfileHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Left Column - User Info */}
          <div className="md:col-span-1 flex flex-col">
            <ProfileAboutCardBorrower profileData={profileData as any | null} />

            {/* Image Gallery */}
            <ImageGalleryBorrower />
          </div>

          {/* Right Column - Posts */}
          <div className="md:col-span-2">
            {/* Create Post Card - Only show if it's the user's own profile */}
            {isOwnProfile && (
              <PostCreationCardBorrower profileData={profileData as any | null} />
            )}

            {/* Posts List */}
            <PostsListBorrower profileData={profileData as any | null} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProfileSection)