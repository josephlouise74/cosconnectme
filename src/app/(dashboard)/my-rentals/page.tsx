'use client'

import { MyRentalsSection } from "@/components/MyRentals/components/MyRentalSection"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"

export default function Page() {
    // Replace with actual user ID from auth context
    const { user } = useSupabaseAuth()
    return <MyRentalsSection userId={user?.id as string} />
}
