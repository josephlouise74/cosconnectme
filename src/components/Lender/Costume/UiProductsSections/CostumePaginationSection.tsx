import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronDown } from "lucide-react";

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    indexOfFirstItem: number;
    indexOfLastItem: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

const CostumePaginationSection = ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    onPageChange,
    onItemsPerPageChange,
    hasNext = currentPage < totalPages,
    hasPrev = currentPage > 1
}: ProductPaginationProps) => {
    // Generate pagination items
    const generatePaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;

        // Calculate range of pages to show
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Add first page if not included
        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => onPageChange(1)}>
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            // Add ellipsis if there's a gap
            if (startPage > 2) {
                items.push(
                    <PaginationItem key="start-ellipsis">
                        <span className="px-4">...</span>
                    </PaginationItem>
                );
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={i === currentPage}
                        onClick={() => i !== currentPage && onPageChange(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Add last page if not included
        if (endPage < totalPages) {
            // Add ellipsis if there's a gap
            if (endPage < totalPages - 1) {
                items.push(
                    <PaginationItem key="end-ellipsis">
                        <span className="px-4">...</span>
                    </PaginationItem>
                );
            }

            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink onClick={() => onPageChange(totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:justify-between">
            <div className="text-sm text-gray-500 text-center md:text-left order-2 md:order-1">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} products
            </div>
            <Pagination className="order-1 md:order-2">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => hasPrev && onPageChange(currentPage - 1)}
                            className={!hasPrev ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>

                    <div className="hidden sm:flex">
                        {generatePaginationItems()}
                    </div>

                    <PaginationItem className="sm:hidden">
                        <span className="text-sm font-medium">
                            {currentPage} / {totalPages}
                        </span>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => hasNext && onPageChange(currentPage + 1)}
                            className={!hasNext ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            <div className="flex items-center gap-2 order-3">
                <span className="text-sm text-gray-500 hidden sm:inline">Items per page:</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            {itemsPerPage}
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {[5, 10, 20, 50].map((value) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => {
                                    onItemsPerPageChange(value);
                                    onPageChange(1);
                                }}
                            >
                                {value} items
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default CostumePaginationSection;