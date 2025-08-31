"use client"
import { LenderRentalsSection } from '@/components/Lender/ManageRentals/ManageRentalsSection'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import React from 'react'

const page = () => {

    const { user } = useSupabaseAuth()
    return (
        <div className="container mx-auto py-6">
            <LenderRentalsSection userId={user?.id as string || ""} />
        </div>
    )
}

export default page
