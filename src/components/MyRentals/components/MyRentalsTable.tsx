"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Eye, Loader2, Package2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { BorrowerRentalDetailsModal } from "./MyRentalsViewDataModal"

// Define proper types based on the API response
interface Costume {
    id: string
    name: string
    brand: string
    category: string
    sizes: string
    rental_price: string
    security_deposit: string
    main_images: {
        back: string
        front: string
    }
    description: string
}

interface CostumeSnapshot {
    id: string
    name: string
    brand: string
    sizes: string
    category: string
    lender_info: {
        uid: string
        name: string
        email: string
        phone: string
        is_business: boolean
    }
    main_images: {
        back: string
        front: string
    }
    rental_price: string
    security_deposit: string
}

interface Rental {
    id: string
    reference_code: string
    status: string
    total_amount: string
    rental_amount: string
    security_deposit: string
    extension_fee: string
    damage_cost: string
    amount_paid: string
    remaining_balance: string
    payment_status: string
    start_date: string
    end_date: string
    extended_days: number
    created_at: string
    updated_at: string
    pickup_location: string
    delivery_method: string
    special_instructions: string
    damage_reported: boolean
    initial_condition_notes: string | null
    return_condition_notes: string | null
    notes: string
    costume: Costume
    costume_snapshot: CostumeSnapshot
    renter_snapshot: {
        uid: string
        name: string
        email: string
        phone: string
        address: string
    }
    payments: {
        status: string
        amount: string
        payment_type: string
        created_at: string
        updated_at: string
    }[]
}

interface MyRentalsTableProps {
    data: Rental[]
    isLoading: boolean
    error: any
}

export function MyRentalsTable({ data, isLoading, error }: MyRentalsTableProps) {
    // State for the details modal
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null)

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
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Calculate duration in days between start and end date
    const calculateDurationDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Updated function to open the details modal
    const handleViewDetails = (rentalId: string) => {
        setSelectedRentalId(rentalId)
        setIsDetailsModalOpen(true)
    }

    // Function to close the modal
    const handleCloseModal = () => {
        setIsDetailsModalOpen(false)
        setSelectedRentalId(null)
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
        <>
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
                                                <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                                                    <Image
                                                        src={rental.costume_snapshot.main_images.front || "/placeholder.svg?height=40&width=40"}
                                                        alt={rental.costume_snapshot.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                        priority={false}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{rental.costume_snapshot.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs px-2 py-0">
                                                            {rental.costume_snapshot.category}
                                                        </Badge>
                                                        {rental.costume_snapshot.brand && (
                                                            <span className="text-xs text-muted-foreground">{rental.costume_snapshot.brand}</span>
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
                                                <div className="text-xs text-muted-foreground">
                                                    ({calculateDurationDays(rental.start_date, rental.end_date)} days)
                                                    {rental.extended_days > 0 && ` + ${rental.extended_days} extended`}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm">{formatCurrency(rental.total_amount)}</p>
                                                <p className="text-xs text-muted-foreground">Base: {formatCurrency(rental.rental_amount)}</p>
                                                <p className="text-xs text-muted-foreground">Deposit: {formatCurrency(rental.security_deposit)}</p>
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
                                            {rental.amount_paid !== "0.00" && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Paid: {formatCurrency(rental.amount_paid)}
                                                </p>
                                            )}
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

            {/* Rental Details Modal */}
            <BorrowerRentalDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseModal}
                rentalId={selectedRentalId}
            />
        </>
    )
}