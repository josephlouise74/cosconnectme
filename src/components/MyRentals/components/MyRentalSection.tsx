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

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <MyRentalsHeader />

            <MyRentalsFilters statusFilter={statusFilter} onStatusFilterChange={handleStatusFilterChange} />

            <MyRentalsTable data={data?.data?.rentals || []} isLoading={isLoading} error={error} />

            {data?.data?.pagination && (
                <MyRentalsPagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={data.data.pagination.total_count}
                    totalPages={data.data.pagination.total_pages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
}
