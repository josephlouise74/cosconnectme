"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useGetRentalDataById } from "@/lib/api/rentalApi"
import {
    AlertCircle,
    Calendar,
    Check,
    Clock,
    CreditCard,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Receipt,
    ShoppingBag,
    Truck,
    User,
    X
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface LenderRentalDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    rentalId: string | null
    onApprove?: (rentalId: string) => void | Promise<void>
    onReject?: (rentalId: string, message?: string) => void | Promise<void>
    isUpdating?: boolean
    updateError?: any
}

export function LenderRentalDetailsModal({
    isOpen,
    onClose,
    rentalId,
    onApprove,
    onReject,
    isUpdating = false,
    updateError
}: LenderRentalDetailsModalProps) {
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectMessage, setRejectMessage] = useState("")

    // Data fetching
    const {
        isLoading: loadingDetails,
        error,
        rental,
        costumeSnapshot,
        renterSnapshot,
        payments,
        paymentSummary
    } = useGetRentalDataById(rentalId || "")

    // Logging for debugging
    useEffect(() => {
        if (rental) {
            console.log({
                rentalId,
                rental,
                costumeSnapshot,
                renterSnapshot,
                payments,
                paymentSummary,
                canUpdateStatus: rental?.status === "pending",
                duration: rental.duration_days,
                isOverdue: rental && new Date(rental.end_date) < new Date() && rental.status === 'active',
            });
        }
    }, [rental, rentalId, costumeSnapshot, renterSnapshot, payments, paymentSummary]);

    if (!rentalId) return null

    // UI state - check if we can update the status
    const canUpdateStatus = rental?.status === "pending"

    // Action handlers
    const handleAccept = async () => {
        if (onApprove && rentalId) {
            await onApprove(rentalId)
            onClose()
        }
    }

    const handleRejectConfirm = async () => {
        if (onReject && rentalId) {
            await onReject(rentalId, rejectMessage.trim())
            setShowRejectDialog(false)
            setRejectMessage("")
            onClose()
        }
    }

    const handleRejectCancel = () => {
        setShowRejectDialog(false)
        setRejectMessage("")
    }

    // Utility functions
    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return colors[status?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            paid: 'bg-green-100 text-green-800',
            fully_paid: 'bg-green-100 text-green-800',
            partially_paid: 'bg-yellow-100 text-yellow-800',
            unpaid: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        }
        return colors[status?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: string | number) => {
        return `₱${Number(amount).toLocaleString()}`
    }

    // Check if rental is overdue
    const isOverdue = rental && new Date(rental.end_date) < new Date() && rental.status === 'active'
    const daysOverdue = isOverdue && rental ? Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Component for section items with consistent styling
    const DetailItem = ({ label, value, icon, className }: { label: string, value: React.ReactNode, icon?: React.ReactNode, className?: string }) => (
        <div className={cn("space-y-0.5", className)}>
            <div className="flex items-center">
                {icon && <span className="mr-1.5 text-muted-foreground">{icon}</span>}
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
            <p className="text-sm break-words font-medium">{value}</p>
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] h-[90vh] p-0 gap-0 flex flex-col">
                    {/* Fixed Header */}
                    <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-white">
                        <DialogTitle className="flex items-center justify-between">
                            {loadingDetails ? (
                                <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    <span className="text-base">Loading rental details...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <span className="text-base font-semibold">Rental Details</span>
                                    {rental?.reference_code && (
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            ({rental.reference_code})
                                        </span>
                                    )}
                                </div>
                            )}

                            {!loadingDetails && canUpdateStatus && (
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowRejectDialog(true)}
                                        disabled={isUpdating}
                                        className="h-8 px-3 text-xs"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                        ) : (
                                            <X className="h-3 w-3 mr-1.5" />
                                        )}
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleAccept}
                                        disabled={isUpdating}
                                        className="h-8 px-3 text-xs"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                        ) : (
                                            <Check className="h-3 w-3 mr-1.5" />
                                        )}
                                        Accept
                                    </Button>
                                </div>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-hidden">
                        {error ? (
                            <div className="p-6">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Failed to load rental details. Please try again.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : loadingDetails ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-6">
                                    {/* Status section */}
                                    <div className="mb-6 flex items-center gap-3 flex-wrap">
                                        <Badge className={cn("text-xs px-3 py-1", getStatusColor(rental?.status || ''))}>
                                            {rental?.status?.toUpperCase()}
                                        </Badge>
                                        {isOverdue && (
                                            <Badge variant="destructive" className="text-xs px-3 py-1">
                                                OVERDUE ({daysOverdue} DAYS)
                                            </Badge>
                                        )}
                                        {rental?.payment_gcash_number && (
                                            <Badge variant="outline" className="text-xs px-3 py-1">
                                                Payment via GCash: {rental.payment_gcash_number}
                                            </Badge>
                                        )}
                                    </div>

                                    {updateError && (
                                        <Alert variant="destructive" className="mb-6">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Failed to update rental status. Please try again.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Main content grid */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-6">
                                            {/* Costume Information */}
                                            <Card className="shadow-sm border">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-base flex items-center">
                                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                                        Costume Information
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {costumeSnapshot?.main_images?.front && (
                                                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-50">
                                                            <Image
                                                                src={costumeSnapshot.main_images.front}
                                                                alt={costumeSnapshot.name || "Costume image"}
                                                                fill
                                                                className="object-contain"
                                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-4">
                                                        <DetailItem
                                                            label="Costume Name"
                                                            value={<span className="text-base font-semibold">{costumeSnapshot?.name || "-"}</span>}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <DetailItem label="Brand" value={costumeSnapshot?.brand || "-"} />
                                                            <DetailItem label="Size" value={costumeSnapshot?.sizes || "-"} />
                                                        </div>

                                                        <DetailItem label="Category" value={costumeSnapshot?.category || "-"} />

                                                        <Separator />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <DetailItem
                                                                label="Rental Price"
                                                                value={<span className="text-green-600 font-semibold">{formatCurrency(costumeSnapshot?.rental_price || 0)}</span>}
                                                                icon={<CreditCard className="h-4 w-4" />}
                                                            />
                                                            <DetailItem
                                                                label="Security Deposit"
                                                                value={<span className="text-blue-600 font-semibold">{formatCurrency(costumeSnapshot?.security_deposit || 0)}</span>}
                                                                icon={<CreditCard className="h-4 w-4" />}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Renter Information */}
                                            <Card className="shadow-sm border">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-base flex items-center">
                                                        <User className="h-4 w-4 mr-2" />
                                                        Renter Information
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <DetailItem
                                                        label="Full Name"
                                                        value={<span className="font-semibold">{renterSnapshot?.name || "-"}</span>}
                                                        icon={<User className="h-4 w-4" />}
                                                    />
                                                    <DetailItem
                                                        label="Email Address"
                                                        value={renterSnapshot?.email || "-"}
                                                        icon={<Mail className="h-4 w-4" />}
                                                    />
                                                    <DetailItem
                                                        label="Phone Number"
                                                        value={renterSnapshot?.phone || "-"}
                                                        icon={<Phone className="h-4 w-4" />}
                                                    />
                                                    <DetailItem
                                                        label="Address"
                                                        value={renterSnapshot?.address || "-"}
                                                        icon={<MapPin className="h-4 w-4" />}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            {/* Rental Details */}
                                            <Card className="shadow-sm border">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-base flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Rental Details
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <DetailItem
                                                            label="Start Date"
                                                            value={<span className="font-medium">{formatDate(rental?.start_date || "")}</span>}
                                                            icon={<Calendar className="h-4 w-4" />}
                                                        />
                                                        <DetailItem
                                                            label="End Date"
                                                            value={<span className="font-medium">{formatDate(rental?.end_date || "")}</span>}
                                                            icon={<Calendar className="h-4 w-4" />}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <DetailItem
                                                            label="Duration"
                                                            value={<span className="font-medium">{rental?.duration_days || 0} days</span>}
                                                            icon={<Clock className="h-4 w-4" />}
                                                        />
                                                        <DetailItem
                                                            label="Delivery Method"
                                                            value={<span className="font-medium">{(rental?.delivery_method || "-").toUpperCase()}</span>}
                                                            icon={<Truck className="h-4 w-4" />}
                                                        />
                                                    </div>

                                                    {rental?.pickup_location && (
                                                        <DetailItem
                                                            label="Pickup Location"
                                                            value={rental.pickup_location}
                                                            icon={<MapPin className="h-4 w-4" />}
                                                        />
                                                    )}

                                                    <Separator />

                                                    {/* Financial Summary */}
                                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                                        <h4 className="font-medium text-sm">Financial Summary</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <DetailItem
                                                                label="Rental Amount"
                                                                value={<span className="text-green-600 font-semibold">{formatCurrency(rental?.rental_amount || 0)}</span>}
                                                            />
                                                            <DetailItem
                                                                label="Security Deposit"
                                                                value={<span className="text-blue-600 font-semibold">{formatCurrency(rental?.security_deposit || 0)}</span>}
                                                            />
                                                        </div>
                                                        <DetailItem
                                                            label="Total Amount"
                                                            value={<span className="text-lg font-bold text-primary">{formatCurrency(rental?.total_amount || 0)}</span>}
                                                            icon={<Receipt className="h-4 w-4" />}
                                                        />
                                                    </div>

                                                    {rental?.special_instructions && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-muted-foreground">Special Instructions</p>
                                                                <div className="bg-blue-50 p-3 rounded-md">
                                                                    <p className="text-sm whitespace-pre-wrap">{rental.special_instructions}</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {rental?.notes && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                                                <div className="bg-yellow-50 p-3 rounded-md">
                                                                    <p className="text-sm whitespace-pre-wrap">{rental.notes}</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Payment Information */}
                                            <Card className="shadow-sm border">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-base flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Payment Information
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                                                        <Badge className={cn("text-xs px-3 py-1", getPaymentStatusColor(paymentSummary?.status || ''))}>
                                                            {(paymentSummary?.status || 'PENDING').toUpperCase().replace('_', ' ')}
                                                        </Badge>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <DetailItem
                                                                label="Total Paid"
                                                                value={<span className="text-green-600 font-semibold">{formatCurrency(paymentSummary?.total_paid || 0)}</span>}
                                                            />
                                                            <DetailItem
                                                                label="Pending Amount"
                                                                value={<span className="text-red-600 font-semibold">{formatCurrency(paymentSummary?.pending_amount || 0)}</span>}
                                                            />
                                                        </div>
                                                        <DetailItem
                                                            label="Total Refunded"
                                                            value={<span className="text-blue-600 font-semibold">{formatCurrency(paymentSummary?.total_refunded || 0)}</span>}
                                                        />
                                                    </div>

                                                    {rental?.refund_gcash_number && rental?.refund_account_name && (
                                                        <div className="bg-blue-50 p-3 rounded-md">
                                                            <DetailItem
                                                                label="Refund GCash Details"
                                                                value={`${rental.refund_account_name} (${rental.refund_gcash_number})`}
                                                                icon={<Phone className="h-4 w-4" />}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Payment History */}
                                                    {payments && payments.length > 0 && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-3">
                                                                <h4 className="font-medium text-sm">Payment History</h4>
                                                                <div className="space-y-2">
                                                                    {payments.map((payment) => (
                                                                        <div
                                                                            key={payment.id}
                                                                            className="flex justify-between items-center p-3 rounded-md border bg-white"
                                                                        >
                                                                            <div className="flex flex-col">
                                                                                <p className="text-sm font-medium">
                                                                                    {payment.description || payment.payment_type}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {payment.processed_at
                                                                                        ? formatDate(payment.processed_at)
                                                                                        : formatDate(payment.created_at)} • {payment.payment_method.toUpperCase()}
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex flex-col items-end">
                                                                                <p className="text-sm font-semibold">
                                                                                    {formatCurrency(payment.amount)}
                                                                                </p>
                                                                                <Badge className={cn(
                                                                                    "text-xs px-2 py-0.5",
                                                                                    payment.status === 'paid'
                                                                                        ? 'bg-green-100 text-green-800'
                                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                                )}>
                                                                                    {payment.status.toUpperCase()}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Extension Details (if applicable) */}
                                            {rental?.extended_days !== undefined && rental.extended_days > 0 && (
                                                <Card className="shadow-sm border border-orange-200">
                                                    <CardHeader className="pb-4">
                                                        <CardTitle className="text-base flex items-center text-orange-700">
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            Extension Details
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <DetailItem
                                                                label="Extended Days"
                                                                value={<span className="font-semibold">{rental.extended_days} days</span>}
                                                            />
                                                            <DetailItem
                                                                label="Extension Fee"
                                                                value={<span className="font-semibold text-orange-600">{formatCurrency(rental.extension_fee)}</span>}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Damage Information (if applicable) */}
                                            {rental?.damage_reported && (
                                                <Card className="shadow-sm border border-red-200">
                                                    <CardHeader className="pb-4">
                                                        <CardTitle className="text-base flex items-center text-red-700">
                                                            <AlertCircle className="h-4 w-4 mr-2" />
                                                            Damage Report
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <DetailItem
                                                            label="Damage Cost"
                                                            value={<span className="font-semibold text-red-600">{formatCurrency(rental.damage_cost)}</span>}
                                                        />
                                                        {rental?.return_condition_notes && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-muted-foreground">Return Condition Notes</p>
                                                                <div className="bg-red-50 p-3 rounded-md">
                                                                    <p className="text-sm whitespace-pre-wrap">{rental.return_condition_notes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">Reject Rental Request</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            Please provide a reason for rejecting this rental request. This message will be sent to the renter.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectMessage}
                        onChange={(e) => setRejectMessage(e.target.value)}
                        className="min-h-[100px] resize-none text-sm"
                    />
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel
                            onClick={handleRejectCancel}
                            className="mt-2 sm:mt-0 text-xs h-9"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectConfirm}
                            disabled={isUpdating || !rejectMessage.trim()}
                            className="w-full sm:w-auto text-xs h-9"
                        >
                            {isUpdating ? (
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                            ) : null}
                            Confirm Rejection
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}