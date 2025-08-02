import UserSignIn from '@/components/auth/UserSignIn'
import React, { Suspense } from 'react'

// Simple loading component
const SignInLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sign-in page...</p>
        </div>
    </div>
)

const SignInPage = () => {
    return (
        <Suspense fallback={<SignInLoading />}>
            <UserSignIn />
        </Suspense>
    )
}

export default SignInPage