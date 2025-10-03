"use client"
import CostumeListSection from '@/components/Lender/Costume/CostumeListSection';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have this component
import { Suspense } from 'react';
const LoadingFallback = () => (
    <div className="w-full space-y-4">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-80 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
    </div>
)



const ProductListPage = () => {
    return (
        <div className='pl-20 m-8'>
            <Suspense fallback={<LoadingFallback />}>
                <CostumeListSection />
            </Suspense>
        </div>
    )
}

export default ProductListPage