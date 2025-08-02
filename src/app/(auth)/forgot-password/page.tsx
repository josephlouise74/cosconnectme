"use client"

import UserForgotPassword from '@/components/auth/UserForgotPassword'
import React, { Suspense } from 'react'

// Simple loading component
const ForgotPageLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sign-in page...</p>
        </div>
    </div>
)

const ForgotPasswordPage = () => {
    return (
        <Suspense fallback={<ForgotPageLoading />}>
            <UserForgotPassword />
        </Suspense>
    )
}

export default ForgotPasswordPage