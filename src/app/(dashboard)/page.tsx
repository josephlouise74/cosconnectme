"use client"

import SocialFeedSection from "@/components/SocialFeed/SocialFeedSection"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
  const {
    isAuthenticated,
    isLoading,

    user,
    userDataError,
    currentRole
  } = useSupabaseAuth()

  const router = useRouter()

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login')
      return
    }
  }, [isAuthenticated, isLoading, router])

  // Handle user data errors
  useEffect(() => {
    if (userDataError && isAuthenticated) {
      console.error('User data error:', userDataError)
      // Optionally redirect to error page or show toast notification
    }
  }, [userDataError, isAuthenticated])

  // Show loading spinner while checking authentication or loading user data
  if (isLoading || !isAuthenticated || (isAuthenticated && !currentRole && !userDataError)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle user data error - redirect to error page or show minimal error
  if (userDataError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-4">We're having trouble loading your account data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Role-based routing
  switch (currentRole) {
    case "lender":
      return (
        <div className="flex overflow-hidden min-h-screen bg-gray-50">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Lender Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.email}</p>
              </div>
              {/* Add your lender dashboard components here */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-500">Lender dashboard content coming soon...</p>
              </div>
            </div>
          </ScrollArea>
        </div>
      )

    case "borrower":
      return (
        <div className="flex overflow-hidden min-h-screen">
          <SocialFeedSection />
        </div>
      )

    default:
      // Handle invalid or missing roles - redirect to role setup or contact support
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
            <div className="w-12 h-12 mx-auto mb-4 text-amber-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Setup Required</h2>
            <p className="text-sm text-gray-600 mb-6">Your account needs to be configured. Please contact support or complete your profile setup.</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/profile/setup')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Complete Setup
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )
  }
}

export default Page