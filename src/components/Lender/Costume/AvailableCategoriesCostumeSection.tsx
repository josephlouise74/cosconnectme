"use client"

// AvailableCategories.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchAllCategories } from '@/lib/apis/categoryApi';
import { Category } from '@/types/categoryType';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface AvailableCategoriesProps {
    initialLimit?: number;
    showPagination?: boolean;
    title?: string;
}

const AvailableCategories: React.FC<AvailableCategoriesProps> = ({
    initialLimit = 8,
    showPagination = true,
    title = "Popular Rental Categories"
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(initialLimit);

    const { data, isLoading, error } = useFetchAllCategories({
        page: currentPage,
        limit: limit,
    });

    // Sort categories by rental count if data is available
    const sortedCategories = React.useMemo(() => {
        if (!data?.data?.categories) return [];
        return [...data.data.categories].sort((a, b) => b.totalRentalCount - a.totalRentalCount);
    }, [data]);

    // Pagination data
    const totalPages = data?.data?.pagination?.totalPages || 1;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    if (error) {
        return (
            <div className="mt-12 p-4 bg-red-50 text-red-600 rounded-md">
                Failed to load categories. Please try again later.
            </div>
        );
    }

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{title}</h3>

                {showPagination && totalPages > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                )}
            </div>

            {isLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array(limit).fill(0).map((_, index) => (
                        <Card key={`skeleton-${index}`} className="overflow-hidden">
                            <CardContent className="p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                // Actual categories
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedCategories.map((category: Category) => (
                        <Link
                            href={`/categories/${category.id}`}
                            key={category.id}
                            passHref
                        >
                            <Card className="overflow-hidden hover:shadow-md transition cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <h4 className="font-medium text-lg">{category.categoryName}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-semibold">{category.totalRentalCount}</span> {category.totalRentalCount === 1 ? 'rental' : 'rentals'}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {category.productListingCount} {category.productListingCount === 1 ? 'listing' : 'listings'}
                                        </p>
                                    </div>
                                    {category.status !== 'active' && (
                                        <p className="text-xs mt-2 text-amber-600">
                                            Status: {category.status}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination controls */}
            {showPagination && totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={!hasPrevPage}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {!showPagination && data?.data?.pagination?.totalPages && data?.data?.pagination?.totalPages > 1 && (
                <div className="mt-6 text-center">
                    <Link href="/categories" className="text-blue-600 hover:text-blue-800 font-medium">
                        View All Categories
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AvailableCategories;