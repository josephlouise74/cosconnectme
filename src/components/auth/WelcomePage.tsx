"use client"

import { useFetchAllCategories } from '@/lib/api/categoryApi';
import { Category } from '@/lib/types/categoryType';
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import '@/lib/styles/embla.css';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react';

// Lazy load components
const BrowseCategorySection = lazy(() => import('@/components/layout/UiSections/BrowseCategorySection'));
const CTASection = lazy(() => import('@/components/layout/UiSections/CTASection'));
/* const FeaturedCustomeSection = lazy(() => import('../UiSections/FeaturedCustomeSection')); */
const HeroSection = lazy(() => import('@/components/layout/UiSections/HeroSection'));
const WhyChooseCosConnectSectio = lazy(() => import('@/components/layout/UiSections/WhyChooseCosConnectSectio'));

// Loading components
const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-lg mb-8"></div>
    </div>
);

const WelcomePage = memo(() => {
    // Get authentication state
    const {
        isAuthenticated,
        currentRole,

        isLoading: authLoading,
        userRolesData
    } = useSupabaseAuth();

    // Determine if user is a borrower
    const isBorrowerAuthenticated = isAuthenticated && currentRole === 'borrower';
    const borrowerUser = isBorrowerAuthenticated ? userRolesData : null;

    // Fetch categories from API
    const {
        data: categoriesData,
        isLoading: isCategoriesLoading,
        error: categoriesError
    } = useFetchAllCategories({
        page: 1,
        limit: 100,
    });

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'center',
            skipSnaps: false,
            dragFree: true,
        },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        // Wait for auth to load before showing content
        if (!authLoading) {
            const timer = setTimeout(() => setIsLoading(false), 500);
            return () => clearTimeout(timer);
        }
        return () => clearTimeout(timer);
    }, [authLoading]);

    const [selectedDot, setSelectedDot] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedDot(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);
        onSelect();

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    // Show loading skeleton while auth is loading
    if (authLoading || isLoading) {
        return (
            <div className="flex flex-col max-w-[1920px] mx-auto w-full">
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col max-w-[1920px] mx-auto w-full">
            <Suspense fallback={<LoadingSkeleton />}>
                {/* Hero Section */}
                <HeroSection
                    borrowerUser={borrowerUser}
                    isBorrowerAuthenticated={isBorrowerAuthenticated}
                    emblaRef={emblaRef}
                    scrollPrev={scrollPrev}
                    scrollNext={scrollNext}
                    scrollTo={scrollTo}
                    emblaApi={emblaApi}
                    selectedDot={selectedDot}
                />

                {/* Featured Costumes Section */}
                {/*    <FeaturedCustomeSection
                    products={products}
                    isLoading={isLoadingProducts}
                    error={productsError}
                /> */}

                {/* Categories Section */}
                <BrowseCategorySection
                    categoriesData={categoriesData?.data.categories as Category[] || []}
                    isLoading={isCategoriesLoading}
                    error={categoriesError}
                />

                {/* Only show Features and CTA sections for non-authenticated users */}
                {!isBorrowerAuthenticated && (
                    <>
                        {/* Features Section */}
                        <WhyChooseCosConnectSectio />
                        {/* CTA Section */}
                        <CTASection />
                    </>
                )}
            </Suspense>
        </div>
    );
});

WelcomePage.displayName = 'WelcomePage';

export default WelcomePage;