"use client"
import UserResetPassword from '@/components/auth/UserResetPassword'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />}>
            <UserResetPassword />
        </Suspense>
    )
}

export default ResetPasswordPage