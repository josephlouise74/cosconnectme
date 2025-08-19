"use client"

import { useParams } from "next/navigation"
import CostumeDetailViewer from "@/components/MarketPlace/Costume/CostumeProductInfoSection"

const Page = () => {
    const params = useParams()

    // Get the ID from the URL params
    const id = Array.isArray(params.id) ? params.id[0] : params.id

    return <CostumeDetailViewer costumeId={id as string} />
}

export default Page