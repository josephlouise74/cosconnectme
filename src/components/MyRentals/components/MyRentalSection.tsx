"use client"
import { useGetMyRentals } from "@/lib/api/rentalApi"
import { useState } from "react"
import { MyRentalsHeader } from "./MyRentalsHeader"
import { MyRentalsFilters } from "./MyRentalsFilters"
import { MyRentalsPagination } from "./MyRentalsPagination"
import { MyRentalsTable } from "./MyRentalsTable"

interface MyRentalsSectionProps {
    userId: string
}

export function MyRentalsSection({ userId }: MyRentalsSectionProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [statusFilter, setStatusFilter] = useState<string>("")

    // Use the API hook with proper types
    const { data, isLoading, error } = useGetMyRentals({
        userId: userId as string,
        page: currentPage as any,
        limit: pageSize as any,
        status: statusFilter || undefined,
    } as any)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status)
        setCurrentPage(1)
    }

    // Get rentals data and pagination from the API response
    const rentals = data?.data?.rentals || []
    const pagination = data?.data?.pagination

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <MyRentalsHeader />

            <MyRentalsFilters
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
            />

            <MyRentalsTable
                data={rentals as any}
                isLoading={isLoading}
                error={error}
            />

            {pagination && (
                <MyRentalsPagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={pagination.total_count}
                    totalPages={pagination.total_pages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
}