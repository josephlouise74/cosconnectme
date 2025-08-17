"use client"
// CostumeProductDetailsSection.tsx - Main Component
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

const SellerInfo = dynamic(() => import('./SellerInfo').then(mod => mod.SellerInfo), {
    loading: () => <Skeleton className="w-full h-64 rounded-lg" />,
    ssr: false
});

const Reviews = dynamic(() => import('./Reviews').then(mod => mod.Reviews), {
    loading: () => <Skeleton className="w-full h-32 rounded-lg" />,
    ssr: false
});

const AvailableCategories = dynamic(() => import('./AvailableCategoriesCostumeSection'), {
    loading: () => <Skeleton className="w-full h-64 rounded-lg mt-12" />,
    ssr: false
});

const CostumeProductDetailsSection: React.FC = () => {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id') || '';

    console.log("productId", productId);


    const { data: product, isLoading, isError, error } = useGetCostumeById(productId, { enabled: Boolean(productId) });
    console.log("prodcy", product)
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Unable to load product</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'There was an error loading this product. Please try again later.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Product Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Left Column - Image Gallery */}
                <div>
                    <ImageGallery costume={product as CostumeItem} />
                </div>

                {/* Right Column - Product Info */}
                <div>
                    <CostumeInfo costume={product as CostumeItem} />
                </div>
            </div>

            {/* Seller Info and Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-12">
                <SellerInfo lenderId={product.lender_user_id} />
                <Reviews />
            </div>

            {/* Similar Products */}
            <AvailableCategories />
        </div>
    );
};

export default CostumeProductDetailsSection;
