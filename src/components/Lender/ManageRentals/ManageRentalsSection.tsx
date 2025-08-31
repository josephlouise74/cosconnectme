"use client"

import { Summary, useGetLenderRentalsRequests } from "@/lib/api/rentalApi"
import { useState } from "react"
import { LenderRentalsHeader } from "./components/LenderRentalsHeader"
import { LenderRentalsFilters } from "./components/LenderRentalsFilters"
import { LenderRentalsTable } from "./components/LenderRentalsTable"
import { LenderRentalsPagination } from "./components/LenderRentalsPagination"

interface LenderRentalsSectionProps {
    userId: string
}

export function LenderRentalsSection({ userId }: LenderRentalsSectionProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [statusFilter, setStatusFilter] = useState<string>("")

    const { data, isLoading, error, refetch } = useGetLenderRentalsRequests({
        userId: userId || "",
        page: currentPage || 1,
        limit: pageSize || 10,
        status: statusFilter || "",
    })

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

    const handleRefresh = () => {
        refetch()
    }

    return (
        <div className="space-y-6">
            <LenderRentalsHeader summary={data?.data.summary as Summary} onRefresh={handleRefresh} isLoading={isLoading} />

            <LenderRentalsFilters statusFilter={statusFilter} onStatusFilterChange={handleStatusFilterChange} />

            <LenderRentalsTable lenderId={userId} data={data?.data.rental_requests || []} isLoading={isLoading} error={error} />

            {data?.data.pagination && (
                <LenderRentalsPagination
                    pagination={data.data.pagination}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
}
