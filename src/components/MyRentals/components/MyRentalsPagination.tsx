"use client"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MyRentalsPaginationProps {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

export function MyRentalsPagination({
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    onPageChange,
    onPageSizeChange,
}: MyRentalsPaginationProps) {
    // Generate page numbers for pagination display
    const generatePageNumbers = () => {
        // If there are no pages, return empty array
        if (totalPages <= 0) return [];

        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // If we have fewer pages than the max visible, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // For many pages, show a subset with ellipses
            if (currentPage <= 3) {
                // Near the start
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Somewhere in the middle
                pages.push(1);
                pages.push("...");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Calculate the range of items being displayed
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Determine if previous/next buttons should be disabled
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages || totalPages === 0;

    // Only show pagination if there are items
    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {totalItems > 0 ? (
                        <>Showing {startItem} to {endItem} of {totalItems} results</>
                    ) : (
                        <>No results</>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => !isPreviousDisabled && onPageChange(currentPage - 1)}
                                className={isPreviousDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                aria-disabled={isPreviousDisabled}
                            />
                        </PaginationItem>

                        {generatePageNumbers().map((page, index) => (
                            <PaginationItem key={index} className="hidden sm:inline-block">
                                {page === "..." ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        onClick={() => onPageChange(page as number)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
                                className={isNextDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                aria-disabled={isNextDisabled}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}   