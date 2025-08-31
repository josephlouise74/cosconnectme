"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Eye, Calendar, Package, MoreHorizontal, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type LenderRentalRequest, useUpdateRentalRequestStatus } from "@/lib/api/rentalApi"

import { LenderRentalDetailsModal } from "./LenderViewRentalModal"
import { RentalRejectionsTable } from "./LenderRentalRejectionsTable"

interface LenderRentalsTableProps {
    data: LenderRentalRequest[]
    isLoading: boolean
    error: any
    lenderId: string
    onRefresh?: () => void
}

export function LenderRentalsTable({ data, isLoading, error, lenderId, onRefresh }: LenderRentalsTableProps) {
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null)
    const [selectedRejectionId, setSelectedRejectionId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { updateStatusAsync, isLoading: isUpdatingStatus, error: updateError } = useUpdateRentalRequestStatus()

    const handleViewDetails = (rentalId: string) => {
        setSelectedRentalId(rentalId)
        setSelectedRejectionId(null)
        setIsModalOpen(true)
    }

    const handleViewRejectionDetails = (rejectionId: string) => {
        setSelectedRejectionId(rejectionId)
        setSelectedRentalId(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedRentalId(null)
        setSelectedRejectionId(null)
    }

    const handleApprove = async (rentalId: string) => {
        try {
            await updateStatusAsync({
                rental_id: rentalId,
                lender_id: lenderId,
                status: "accept",
            })

            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error("Failed to approve rental:", error)
        }
    }

    const handleReject = async (rentalId: string, rejectMessage?: string) => {
        try {
            await updateStatusAsync({
                rental_id: rentalId,
                lender_id: lenderId,
                status: "reject",
                reject_message: rejectMessage || "",
            })

            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error("Failed to reject rental:", error)
        }
    }

    const canManageRental = (request: LenderRentalRequest) => {
        return request.status === "pending"
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
            confirmed: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
            accepted: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
            active: { variant: "default" as const, color: "bg-green-100 text-green-800" },
            completed: { variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
            cancelled: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
            rejected: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

        return (
            <Badge variant={config.variant} className={config.color}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const getPaymentStatusBadge = (status: string) => {
        const paymentConfig = {
            unpaid: { variant: "destructive" as const, label: "Unpaid", color: "bg-red-100 text-red-800" },
            partially_paid: { variant: "secondary" as const, label: "Partial", color: "bg-orange-100 text-orange-800" },
            fully_paid: { variant: "default" as const, label: "Paid", color: "bg-green-100 text-green-800" },
        }

        const config = paymentConfig[status as keyof typeof paymentConfig] || paymentConfig.unpaid

        return (
            <Badge variant={config.variant} className={config.color}>
                {config.label}
            </Badge>
        )
    }

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
        return `₱${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    }

    const renderActiveRentalsTable = () => {
        if (isLoading) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-3 text-muted-foreground">Loading rental requests...</span>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        if (error) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                            <div className="mb-4">
                                <Package className="h-12 w-12 mx-auto opacity-50" />
                            </div>
                            <p className="mb-2">Error loading rental requests.</p>
                            <Button variant="outline" onClick={onRefresh} size="sm">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        if (!data.length) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No rental requests found</h3>
                            <p className="text-sm">When customers request your costumes, they'll appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-semibold text-foreground">Request</TableHead>
                                    <TableHead className="font-semibold text-foreground">Renter</TableHead>
                                    <TableHead className="font-semibold text-foreground">Costume</TableHead>
                                    <TableHead className="font-semibold text-foreground">Rental Period</TableHead>
                                    <TableHead className="font-semibold text-foreground">Amount</TableHead>
                                    <TableHead className="font-semibold text-foreground">Payment</TableHead>
                                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetails(request.id)}
                                    >
                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <p className="font-mono text-sm font-medium text-primary">{request.reference_code}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(request.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-muted">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                        {request.renter.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{request.renter.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{request.renter.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={request.costume.image || "/placeholder.svg?height=44&width=44&query=costume"}
                                                        alt={request.costume.name}
                                                        className="h-11 w-11 rounded-lg object-cover border-2 border-muted"
                                                    />
                                                    {!request.costume.image && (
                                                        <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{request.costume.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {request.costume.brand} • {request.costume.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="font-medium">
                                                        {format(new Date(request.start_date), "MMM dd")} -{" "}
                                                        {format(new Date(request.end_date), "MMM dd")}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {request.duration_days} day{request.duration_days !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm">{formatCurrency(request.total_amount)}</p>
                                                <p className="text-xs text-muted-foreground">Rental: {formatCurrency(request.rental_amount)}</p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">{getPaymentStatusBadge(request.payment_summary.status)}</TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(request.status)}
                                                {canManageRental(request) && (
                                                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" title="Pending action" />
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-muted"
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isUpdatingStatus}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleViewDetails(request.id)
                                                        }}
                                                        className="cursor-pointer"
                                                        disabled={isUpdatingStatus}
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
        )
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Active Rentals
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Rejected Rentals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                    {renderActiveRentalsTable()}
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <RentalRejectionsTable onViewDetails={handleViewRejectionDetails} />
                </TabsContent>
            </Tabs>

            {/* Rental Details Modal */}
            {selectedRentalId && (
                <LenderRentalDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    rentalId={selectedRentalId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isUpdating={isUpdatingStatus}
                    updateError={updateError}
                />
            )}

            {selectedRejectionId && (
                <LenderRentalDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    rentalId={selectedRejectionId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isUpdating={isUpdatingStatus}
                    updateError={updateError}
                />
            )}
        </div>
    )
}
