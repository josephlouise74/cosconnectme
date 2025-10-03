"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Summary } from "@/lib/api/rentalApi"
import { CheckCircle, Clock, Package, RefreshCw, XCircle } from "lucide-react"

interface LenderRentalsHeaderProps {
    summary?: Summary
    onRefresh: () => void
    isLoading: boolean
}

export function LenderRentalsHeader({ summary, onRefresh, isLoading }: LenderRentalsHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rental Requests</h1>
                    <p className="text-muted-foreground">Manage incoming costume rental requests from borrowers</p>
                </div>
                <Button onClick={onRefresh} disabled={isLoading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                            <p className="text-2xl font-bold">{summary?.total_requests || 0}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
