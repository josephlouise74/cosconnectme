"use client"
import UserResetPassword from '@/components/auth/UserResetPassword'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

const ResetPasswordPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            }>
                <UserResetPassword />
            </Suspense>
        </div>
    )
}

export default ResetPasswordPage