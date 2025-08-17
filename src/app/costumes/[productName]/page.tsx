import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic'
import React from 'react'

const CostumeProductDetailsSection = dynamic(() => import('../../../../components/forms/Lender/Costume/CostumeProductInfoSection'), {
    loading: () => <Skeleton className="w-full h-32 rounded-lg mt-8" />,

});

const ProductNamePage = () => {
    return (
        <CostumeProductDetailsSection />
    )
}

export default ProductNamePage