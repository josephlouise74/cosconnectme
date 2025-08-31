"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface MyRentalsFiltersProps {
    statusFilter: string
    onStatusFilterChange: (status: string) => void
}

export function MyRentalsFilters({ statusFilter, onStatusFilterChange }: MyRentalsFiltersProps) {
    const handleClearFilters = () => {
        onStatusFilterChange("")
    }

    return (
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm font-medium">
                    Status:
                </label>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger id="status-filter" className="w-[180px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {statusFilter && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="h-9 bg-transparent">
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                </Button>
            )}
        </div>
    )
}
