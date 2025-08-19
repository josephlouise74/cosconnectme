"use client"

import { Button } from "@/components/ui/button"
import type { Pagination } from "@/lib/types/marketplaceType"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { useMemo } from "react"

interface MarketplacePaginationProps {
    pagination: Pagination
    onPageChange: (page: number) => void
    showFirstLast?: boolean
    maxVisiblePages?: number
}

interface PaginationItem {
    type: "page" | "ellipsis"
    page?: number
    isActive?: boolean
    isDisabled?: boolean
}

const MarketplacePagination = ({
    pagination,
    onPageChange,
    showFirstLast = true,
    maxVisiblePages = 7,
}: MarketplacePaginationProps) => {
    const {
        page: currentPage,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_previous_page: hasPreviousPage,
        total_count: totalItems,
        limit: itemsPerPage = pagination.limit || 12,
    } = pagination

    // Calculate visible page numbers with ellipsis
    const paginationItems: PaginationItem[] = useMemo(() => {
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than max visible
            return Array.from({ length: totalPages }, (_, i) => ({
                type: "page" as const,
                page: i + 1,
                isActive: i + 1 === currentPage,
            }))
        }

        const items: PaginationItem[] = []
        const halfVisible = Math.floor(maxVisiblePages / 2)

        // Always show first page
        items.push({
            type: "page",
            page: 1,
            isActive: currentPage === 1,
        })

        let startPage = Math.max(2, currentPage - halfVisible)
        let endPage = Math.min(totalPages - 1, currentPage + halfVisible)

        // Adjust range to always show maxVisiblePages when possible
        if (endPage - startPage + 1 < maxVisiblePages - 2) {
            if (startPage === 2) {
                endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3)
            } else {
                startPage = Math.max(2, endPage - maxVisiblePages + 3)
            }
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            items.push({ type: "ellipsis" })
            startPage = Math.max(startPage, currentPage - 1)
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            items.push({
                type: "page",
                page: i,
                isActive: i === currentPage,
            })
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            items.push({ type: "ellipsis" })
        }

        // Always show last page (if it's not the first page)
        if (totalPages > 1) {
            items.push({
                type: "page",
                page: totalPages,
                isActive: currentPage === totalPages,
            })
        }

        return items
    }, [currentPage, totalPages, maxVisiblePages])

    // Calculate current range of items being displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const handlePageClick = (page: number) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page)
        }
    }

    const handlePreviousPage = () => {
        if (hasPreviousPage) {
            handlePageClick(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (hasNextPage) {
            handlePageClick(currentPage + 1)
        }
    }

    const handleFirstPage = () => {
        if (currentPage !== 1) {
            handlePageClick(1)
        }
    }

    const handleLastPage = () => {
        if (currentPage !== totalPages) {
            handlePageClick(totalPages)
        }
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
            {/* Results summary */}
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}</span> -{" "}
                <span className="font-medium text-foreground">{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{totalItems}</span> results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page button */}
                {showFirstLast && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFirstPage}
                        disabled={!hasPreviousPage}
                        className="h-9 w-9 p-0 hover:bg-primary/10 bg-transparent"
                        aria-label="Go to first page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                )}

                {/* Previous page button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                    className="h-9 w-9 p-0 hover:bg-primary/10 bg-transparent"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {paginationItems.map((item, index) => {
                        if (item.type === "ellipsis") {
                            return (
                                <div key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center" aria-hidden="true">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )
                        }

                        return (
                            <Button
                                key={item.page}
                                variant={item.isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(item.page!)}
                                className={`h-9 w-9 p-0 ${item.isActive ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}`}
                                aria-label={`Go to page ${item.page}`}
                                aria-current={item.isActive ? "page" : undefined}
                            >
                                {item.page}
                            </Button>
                        )
                    })}
                </div>

                {/* Next page button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className="h-9 w-9 p-0 hover:bg-primary/10 bg-transparent"
                    aria-label="Go to next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page button */}
                {showFirstLast && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLastPage}
                        disabled={!hasNextPage}
                        className="h-9 w-9 p-0 hover:bg-primary/10 bg-transparent"
                        aria-label="Go to last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default MarketplacePagination
