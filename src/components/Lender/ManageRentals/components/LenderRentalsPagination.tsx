"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/lib/api/rentalApi"

interface LenderRentalsPaginationProps {
    pagination: Pagination
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

export function LenderRentalsPagination({
    pagination,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: LenderRentalsPaginationProps) {
    const { current_page, total_pages, total_count, has_prev, has_next } = pagination

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                    Showing {(current_page - 1) * pageSize + 1} to {Math.min(current_page * pageSize, total_count)} of{" "}
                    {total_count} results
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Rows per page:</p>
                    <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                        <SelectTrigger className="w-[70px]">
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

                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Page {current_page} of {total_pages}
                    </p>

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => onPageChange(current_page - 1)} disabled={!has_prev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => onPageChange(current_page + 1)} disabled={!has_next}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
