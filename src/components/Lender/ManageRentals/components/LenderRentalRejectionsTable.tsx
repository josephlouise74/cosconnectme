"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetRentalRejections } from "@/lib/api/rentalApi"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { format } from "date-fns"
import { AlertCircle, Calendar, Eye, MoreHorizontal, Package, RefreshCw, XCircle } from "lucide-react"
import { useState } from "react"

interface RentalRejectionsTableProps {
    onViewDetails?: (rejectionId: string) => void
}

export function RentalRejectionsTable({ onViewDetails }: RentalRejectionsTableProps) {
    const { user } = useSupabaseAuth()
    const { data, isLoading, error, refetch } = useGetRentalRejections(user?.id as string)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refetch()
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleViewDetails = (rejectionId: string) => {
        if (onViewDetails) {
            onViewDetails(rejectionId)
        }
    }

    const getPaymentStatusBadge = (status: string) => {
        const paymentConfig = {
            unpaid: { variant: "destructive" as const, label: "Unpaid", className: "bg-red-100 text-red-800 border-red-200" },
            partially_paid: {
                variant: "secondary" as const,
                label: "Partial",
                className: "bg-orange-100 text-orange-800 border-orange-200",
            },
            fully_paid: {
                variant: "default" as const,
                label: "Paid",
                className: "bg-green-100 text-green-800 border-green-200",
            },
        }

        const config = paymentConfig[status as keyof typeof paymentConfig] || paymentConfig.unpaid

        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        )
    }

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
        return `₱${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    }

    const getDurationDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Loading State
    if (isLoading) {
        return (
            <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-4">
                    <CardTitle className="text-red-900 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Rejected Rentals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <span className="ml-3 text-muted-foreground">Loading rejected rentals...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Error State
    if (error) {
        return (
            <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-red-900 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Rejected Rentals
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            Retry
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        <div className="mb-4">
                            <AlertCircle className="h-12 w-12 mx-auto opacity-50 text-red-500" />
                        </div>
                        <p className="mb-2">Failed to load rejected rentals.</p>
                        <p className="text-sm text-red-600">Please check your connection and try again.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Empty State
    if (!data?.data.rejections.length) {
        return (
            <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-red-900 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Rejected Rentals
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <XCircle className="h-16 w-16 mx-auto mb-4 opacity-40 text-red-400" />
                        <h3 className="text-lg font-medium mb-2 text-red-800">No rejected rentals found</h3>
                        <p className="text-sm text-red-600/70 max-w-md mx-auto">
                            Rental requests you've rejected will appear here. This helps you track your rejection history and reasons.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Data Table
    return (
        <div className="space-y-4">
            <Card className="border-red-200 bg-red-50/10">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-red-900 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Rejected Rentals
                            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                                {data.data.rejections.length}
                            </Badge>
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-red-100/50 hover:bg-red-100/50 border-red-200">
                                    <TableHead className="font-semibold text-red-900">Rejection Details</TableHead>
                                    <TableHead className="font-semibold text-red-900">Renter</TableHead>
                                    <TableHead className="font-semibold text-red-900">Costume</TableHead>
                                    <TableHead className="font-semibold text-red-900">Rental Period</TableHead>
                                    <TableHead className="font-semibold text-red-900">Amount</TableHead>
                                    <TableHead className="font-semibold text-red-900">Payment</TableHead>
                                    <TableHead className="font-semibold text-red-900">Reason</TableHead>
                                    <TableHead className="font-semibold text-red-900 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.rejections.map((rejection: any) => (
                                    <TableRow
                                        key={rejection.id}
                                        className="hover:bg-red-50/50 transition-colors cursor-pointer border-red-100"
                                        onClick={() => handleViewDetails(rejection.id)}
                                    >
                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <p className="font-mono text-sm font-medium text-red-700">{rejection.reference_code}</p>
                                                <p className="text-xs text-red-600/70">
                                                    Rejected: {format(new Date(rejection.rejection.rejected_at), "MMM dd, yyyy 'at' h:mm a")}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-red-200">
                                                    <AvatarFallback className="bg-red-100 text-red-700 font-semibold text-sm">
                                                        {rejection.renter.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{rejection.renter.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{rejection.renter.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            rejection.costume.main_images?.front ||
                                                            "/placeholder.svg?height=44&width=44&query=costume"
                                                        }
                                                        alt={rejection.costume.name}
                                                        className="h-11 w-11 rounded-lg object-cover border-2 border-red-200"
                                                    />
                                                    {!rejection.costume.main_images?.front && (
                                                        <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{rejection.costume.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {rejection.costume.brand} • {rejection.costume.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="font-medium">
                                                        {format(new Date(rejection.request.start_date), "MMM dd")} -{" "}
                                                        {format(new Date(rejection.request.end_date), "MMM dd")}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {getDurationDays(rejection.request.start_date, rejection.request.end_date)} day
                                                    {getDurationDays(rejection.request.start_date, rejection.request.end_date) !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm">{formatCurrency(rejection.request.total_amount)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Rental: {formatCurrency(rejection.request.rental_amount)}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">{getPaymentStatusBadge(rejection.payment.status)}</TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-red-700 truncate">{rejection.rejection.reason}</p>
                                                    {rejection.rejection.message && (
                                                        <p className="text-xs text-red-600/70 truncate mt-1" title={rejection.rejection.message}>
                                                            {rejection.rejection.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-red-100"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleViewDetails(rejection.id)
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {data.data.pagination && data.data.pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {(data.data.pagination.current_page - 1) * data.data.pagination.per_page + 1} to{" "}
                        {Math.min(
                            data.data.pagination.current_page * data.data.pagination.per_page,
                            data.data.pagination.total_count,
                        )}{" "}
                        of {data.data.pagination.total_count} rejected rentals
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={!data.data.pagination.has_prev_page}>
                            Previous
                        </Button>
                        <div className="text-sm">
                            Page {data.data.pagination.current_page} of {data.data.pagination.total_pages}
                        </div>
                        <Button variant="outline" size="sm" disabled={!data.data.pagination.has_next_page}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
