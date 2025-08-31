"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface LenderRentalsFiltersProps {
    statusFilter: string
    onStatusFilterChange: (status: string) => void
}

export function LenderRentalsFilters({ statusFilter, onStatusFilterChange }: LenderRentalsFiltersProps) {
    const handleClearFilters = () => {
        onStatusFilterChange("")
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    {statusFilter && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                            Clear filters
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
