"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCostumeById } from '@/lib/api/marketplaceApi';

import { CostumeItem } from '@/lib/types/marketplaceType';


import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React from 'react';

// Lazy-loaded components
const ImageGallery = dynamic(() => import('./ImageGallery'), {
    loading: () => <Skeleton className="w-full h-96 rounded-lg" />,
    ssr: false
});

const CostumeInfo = dynamic(() => import('./CostumeInfo'), {
    loading: () => <Skeleton className="w-full h-96 rounded-lg" />,
    ssr: false
});

const SellerInfo = dynamic(() => import('@/components/Lender/Costume/SellerInfo'), {
    loading: () => <Skeleton className="w-full h-64 rounded-lg" />,
    ssr: false
});

const Reviews = dynamic(() => import('@/components/Lender/Costume/Reviews'), {
    loading: () => <Skeleton className="w-full h-32 rounded-lg" />,
    ssr: false
});

const AvailableCategories = dynamic(() => import('./AvailableCategoriesCostumeSection'), {
    loading: () => <Skeleton className="w-full h-64 rounded-lg mt-12" />,
    ssr: false
});

const CostumeDetailsSection = () => {
    const searchParams = useSearchParams();
    const costumeId = searchParams.get('id') || '';

    const {
        data: costume,
        isLoading,
        isError,
        error
    } = useGetCostumeById(costumeId);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading costume details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !costume) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Error loading costume</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'Failed to load costume. Please try again later.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Main content grid */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div>
                    <ImageGallery costume={costume as CostumeItem} />
                </div>
                <div>
                    <CostumeInfo costume={costume as CostumeItem} />
                </div>
            </div>

            {/* Secondary sections */}
            <div className="grid lg:grid-cols-2 gap-8 my-12">
                <SellerInfo lenderId={costume.lender_user_id as string || ""} />
                <Reviews />
            </div>

            <AvailableCategories />
        </div>
    );
};

export default CostumeDetailsSection;
