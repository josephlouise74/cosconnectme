"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Loader2, Calendar, Package2 } from "lucide-react"
import { Costume } from "@/lib/api/rentalApi"
interface Rental {
    id: string
    reference_code: string
    status: string
    total_amount: string
    start_date: string
    end_date: string
    created_at: string
    costume: Costume
    payment_status: string
    amount_paid: string
}

interface MyRentalsTableProps {
    data: any[]
    isLoading: boolean
    error: any
}

export function MyRentalsTable({ data, isLoading, error }: MyRentalsTableProps) {
    console.log("dat222a", data)
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "default"
            case "pending":
                return "secondary"
            case "in_progress":
                return "outline"
            case "completed":
                return "default"
            case "cancelled":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const getPaymentStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "default"
            case "pending":
                return "secondary"
            case "failed":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const handleViewDetails = (rentalId: string) => {
        console.log("View details for rental:", rentalId)
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="text-center">
                            <p className="font-medium">Loading your rentals...</p>
                            <p className="text-sm text-muted-foreground">Please wait a moment</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full bg-destructive/10 p-3">
                            <Package2 className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-destructive">Error loading rentals</p>
                            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full bg-muted p-4">
                            <Package2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">No rentals found</p>
                            <p className="text-sm text-muted-foreground mt-1">You haven't made any rental requests yet</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Reference</TableHead>
                                <TableHead className="font-semibold">Costume Details</TableHead>
                                <TableHead className="font-semibold">Rental Period</TableHead>
                                <TableHead className="font-semibold">Amount</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Payment</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((rental) => (
                                <TableRow key={rental.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-mono text-sm font-medium">{rental.reference_code}</p>
                                            <p className="text-xs text-muted-foreground">Created {formatDate(rental.created_at)}</p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={rental.costume.image || "/placeholder.svg?height=40&width=40"}
                                                alt={rental.costume.name}
                                                className="h-10 w-10 rounded-md object-cover border"
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{rental.costume.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs px-2 py-0">
                                                        {rental.costume.category}
                                                    </Badge>
                                                    {rental.costume.brand && (
                                                        <span className="text-xs text-muted-foreground">{rental.costume.brand}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-medium">{formatDate(rental.start_date)}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">to {formatDate(rental.end_date)}</div>
                                            <div className="text-xs text-muted-foreground">({rental.duration_days} days)</div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm">{formatCurrency(rental.total_amount)}</p>
                                            <p className="text-xs text-muted-foreground">Base: {formatCurrency(rental.rental_amount)}</p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={getStatusVariant(rental.status)} className="capitalize">
                                            {rental.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={getPaymentStatusVariant(rental.payment_status)} className="capitalize">
                                            {rental.payment_status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetails(rental.id)}
                                            className="h-8 px-3 hover:bg-primary/10"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
