// components/PostPagination.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal
} from 'lucide-react';
import { memo, useMemo } from 'react';

interface PostPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    isLoading?: boolean;
    className?: string;
}

const PostPagination = memo(({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    showItemsPerPage = true,
    isLoading = false,
    className = ""
}: PostPaginationProps) => {

    // Calculate page numbers to show
    const pageNumbers = useMemo(() => {
        const delta = 2; // Number of pages to show on each side of current page
        const pages: (number | 'ellipsis')[] = [];

        if (totalPages <= 7) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage - delta > 2) {
                pages.push('ellipsis');
            }

            // Show pages around current page
            const startPage = Math.max(2, currentPage - delta);
            const endPage = Math.min(totalPages - 1, currentPage + delta);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (currentPage + delta < totalPages - 1) {
                pages.push('ellipsis');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    }, [currentPage, totalPages]);

    // Calculate items range
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && !isLoading) {
            onPageChange(page);
        }
    };

    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = parseInt(value, 10);
        if (onItemsPerPageChange) {
            onItemsPerPageChange(newItemsPerPage);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Items per page selector */}
            {showItemsPerPage && onItemsPerPageChange && (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Items per page:
                    </span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={handleItemsPerPageChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Page info */}
            <div className="text-sm text-muted-foreground order-first sm:order-none">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>

            {/* PostPagination controls */}
            <div className="flex items-center space-x-1">
                {/* First page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 w-8 p-0"
                    aria-label="Go to first page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 w-8 p-0"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((page, index) => (
                        page === 'ellipsis' ? (
                            <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        ) : (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                disabled={isLoading}
                                className={`h-8 w-8 p-0 ${currentPage === page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                    }`}
                                aria-label={`Go to page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </Button>
                        )
                    ))}
                </div>

                {/* Next page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                    aria-label="Go to next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                    aria-label="Go to last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

PostPagination.displayName = 'PostPagination';
export default PostPagination;