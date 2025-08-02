import { cn } from '@/lib/utils';
import { Category } from '@/lib/types/categoryType';
import Link from 'next/link';
import React from 'react';


interface BrowseCategorySectionProps {
    categoriesData: Category[] | undefined;
    isLoading: boolean;
    error?: any;
}

const BrowseCategorySection = ({ categoriesData, isLoading, error }: BrowseCategorySectionProps) => {
    if (isLoading) {
        return (
            <section className="py-16 w-full">
                <div className="w-full mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="p-6 rounded-lg bg-gray-200 h-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || !categoriesData) {
        return (
            <section className="py-16 w-full">
                <div className="w-full mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
                    <p className="text-text-muted">Failed to load category data. Please try again later.</p>
                </div>
            </section>
        );
    }

    // Filter out categories with status that's not "active" if needed
    const activeCategories = categoriesData.filter(cat => cat.status === "active");

    return (
        <section className={cn(
            "py-16 w-full",
            "bg-background dark:bg-background-dark",
            "border-t border-border dark:border-border-dark"
        )}>
            <div className="w-full mx-auto px-4">
                <h2 className={cn(
                    "text-3xl font-bold mb-8 text-center font-heading",
                    "text-text dark:text-text-dark"
                )}>
                    Browse by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                            className="group"
                        >
                            <div className={cn(
                                "p-6 rounded-lg",
                                "bg-card dark:bg-card-dark",
                                "text-card-foreground dark:text-card-foreground-dark",
                                "border border-border dark:border-border-dark",
                                "shadow-sm transition-all duration-300",
                                "hover:shadow-md",
                                "hover:border-rose-600",
                                "hover:bg-rose-600",
                                "hover:text-white dark:hover:text-white"
                            )}>
                                <h3 className={cn(
                                    "font-semibold mb-1",
                                    "text-text dark:text-text-dark",
                                    "group-hover:text-white"
                                )}>
                                    {category.categoryName}
                                </h3>
                                <p className={cn(
                                    "text-sm",
                                    "text-text-muted dark:text-text-muted-dark",
                                    "group-hover:text-white/80",
                                    "transition-colors duration-300"
                                )}>
                                    {category.productListingCount} costumes
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default React.memo(BrowseCategorySection)