"use client"

import WelcomePage from "@/components/auth/WelcomePage"
import SocialFeedSection from "@/components/SocialFeed/SocialFeedSection"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { signOut } from "actions/auth"
import { useEffect } from "react"

const Page = () => {
    const {
        isAuthenticated,
        isLoading,
        user,
        userDataError,
        currentRole,
        retryFetchRoles,
        retryCount,
        maxRetries
    } = useSupabaseAuth()


    // Handle user data errors
    useEffect(() => {
        if (userDataError && isAuthenticated) {
            console.error('User data error:', userDataError)
            // Optionally redirect to error page or show toast notification
        }
    }, [userDataError, isAuthenticated])

    // Show loading spinner only while initially checking authentication status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // If user is not authenticated, show the welcome page as landing page
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <WelcomePage />
            </div>
        )
    }

    // Show loading for authenticated users while user data is being fetched
    if (isAuthenticated && !currentRole && !userDataError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                    <p className="text-sm text-gray-600">Loading your profile...</p>
                    {retryCount > 0 && (
                        <p className="text-xs text-gray-500">Retry attempt {retryCount}/{maxRetries}</p>
                    )}
                </div>
            </div>
        )
    }

    // Handle user data error - provide retry option and better messaging
    if (userDataError && !currentRole) {
        const isNetworkError = userDataError.message?.includes('fetch') ||
            userDataError.message?.includes('network') ||
            userDataError.message?.includes('Failed to fetch')

        const isAuthError = userDataError.message?.includes('JWT') ||
            userDataError.message?.includes('token') ||
            userDataError.message?.includes('unauthorized')

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
                    <div className="w-12 h-12 mx-auto mb-4 text-red-500">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {isAuthError ? 'Authentication Issue' : 'Loading Profile Failed'}
                    </h2>

                    <p className="text-sm text-gray-600 mb-4">
                        {isAuthError
                            ? 'There was an issue with your authentication. Please sign in again.'
                            : isNetworkError
                                ? 'Network connection issue. Please check your internet and try again.'
                                : 'We\'re having trouble loading your profile data.'}
                    </p>

                    {retryCount > 0 && retryCount < maxRetries && (
                        <p className="text-xs text-gray-500 mb-4">
                            Retry attempt {retryCount}/{maxRetries}
                        </p>
                    )}

                    <div className="space-y-2">
                        {!isAuthError && retryCount < maxRetries && (
                            <button
                                onClick={retryFetchRoles}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Retrying...' : 'Try Again'}
                            </button>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Refresh Page
                        </button>

                        {isAuthError && (
                            <button
                                onClick={() => signOut()}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Sign Out & Try Again
                            </button>
                        )}
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-left">
                            <summary className="text-xs text-gray-500 cursor-pointer">Error Details (Dev)</summary>
                            <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                                {JSON.stringify(userDataError, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        )
    }

    // Role-based routing for authenticated users
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
            // Handle invalid or missing roles - show welcome page for role setup
            // But only if we're not in an error state
            if (!userDataError) {
                return (
                    <div className="flex items-center justify-center min-h-screen bg-gray-50">
                        <WelcomePage />
                    </div>
                )
            }

            // If we have both no role and an error, we've already handled it above
            return null
    }
}

export default Page