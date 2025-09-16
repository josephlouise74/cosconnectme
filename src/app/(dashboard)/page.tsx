"use client"

import SocialFeedSection from "@/components/SocialFeed/SocialFeedSection"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
/* import Dashboard from "@/components/forms/Lender/DashboardLender";
import SocialFeedSection from "@/components/forms/Lender/SocialFeed/SocialFeedSection"; */
import { cn } from "@/lib/utils"

const Page = () => {
  const { isAuthenticated, isLoading, userData, user, userDataError, currentRole } = useSupabaseAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-900" />
      </div>
    )
  }

  // Show welcome page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col w-full">
        <main className="flex-1 w-full mx-auto">{/*  <WelcomePage /> */}</main>
      </div>
    )
  }

  // If user is authenticated but we're still waiting for role data
  if (isAuthenticated && !userData && !userDataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-900 mx-auto mb-4" />
          <p className="text-lg">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && userDataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error loading user data</p>
          <p className="text-sm text-gray-600">{userDataError.message}</p>
        </div>
      </div>
    )
  }

  // Show dashboard for lenders
  if (currentRole === "lender") {
    return (
      <div className="flex overflow-hidden min-h-screen">
        <ScrollArea className="flex-1">

        </ScrollArea>
      </div>
    )
  }

  // Show social feed for borrowers
  if (currentRole === "borrower") {
    return <div className="flex overflow-hidden min-h-screen"><SocialFeedSection /></div>
  }

  // Fallback for any unexpected state - show debug info
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className={cn("text-xl mb-4")}>Unauthorized Access - Invalid Role</p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Debug Info:</p>
          <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
          <p>Current Role: {currentRole || "null"}</p>
          <p>User Data: {userData ? "Loaded" : "Not loaded"}</p>
          <p>API Current Role: {userData?.current_role || "Not set"}</p>
          <p>Available Roles: {userData?.roles?.join(", ") || "None"}</p>
          <p>User Metadata Role: {user?.user_metadata?.role || "Not set"}</p>
        </div>
      </div>
    </div>
  )
}

export default Page
