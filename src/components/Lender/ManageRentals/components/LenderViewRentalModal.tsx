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
    Package,
    Phone,
    Receipt,
    Truck,
    User,
    X
} from "lucide-react"
import { useState } from "react"

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

    // Data fetching - using the updated API hook
    const {

        isLoading: loadingDetails,
        error,
        rental,
        costumeSnapshot,
        renterSnapshot,
        payments
    } = useGetRentalDataById(rentalId || "")

    if (!rentalId) return null

    // Calculate payment summary from the rental data
    const paymentSummary = rental ? {
        total_paid: rental.amount_paid,
        pending_amount: rental.remaining_balance,
        is_fully_paid: rental.payment_status === 'paid' || Number(rental.remaining_balance) === 0
    } : null

    // UI state - simplified since we don't have metadata.can_cancel
    const canUpdateStatus = rental?.status === "pending" || rental?.status === "confirmed"

    // Handlers - delegate to parent props
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

    // Calculate rental duration
    const calculateDuration = (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return 0
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const duration = rental ? calculateDuration(rental.start_date, rental.end_date) : 0

    // Check if rental is overdue (simplified logic)
    const isOverdue = rental && new Date(rental.end_date) < new Date() && rental.status === 'active'
    const daysOverdue = isOverdue ? Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24)) : 0

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="flex items-center gap-2 flex-wrap">
                            <Package className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Rental Request Details</span>
                            {rental && (
                                <Badge className={`${getStatusColor(rental.status)} flex-shrink-0`}>
                                    {rental.status.toUpperCase()}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[calc(95vh-140px)]">
                        {/* Loading State */}
                        {loadingDetails && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading rental details...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {(error || updateError) && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {error ? "Failed to load rental details. Please try again." : "Failed to update rental status. Please try again."}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Main Content */}
                        {rental && (
                            <div className="space-y-6 p-1">
                                {/* Header Summary */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="space-y-2 min-w-0">
                                                <h3 className="text-xl font-semibold truncate">
                                                    {costumeSnapshot?.name || rental.costume?.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Reference: <span className="font-mono">{rental.reference_code}</span>
                                                </p>
                                                <div className="flex items-center gap-2 text-sm flex-wrap">
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                                                    </span>
                                                    <Badge variant="outline" className="flex-shrink-0">
                                                        {duration} days
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <Badge
                                                    variant={paymentSummary?.is_fully_paid ? "default" : "destructive"}
                                                    className="w-fit"
                                                >
                                                    {paymentSummary?.is_fully_paid ? "✓ Fully Paid" : "⚠ Payment Pending"}
                                                </Badge>
                                                {isOverdue && (
                                                    <Badge variant="destructive" className="w-fit">
                                                        Overdue by {daysOverdue} days
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons - Only show if handlers are provided */}
                                {canUpdateStatus && (onApprove || onReject) && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <span>This rental request is ready for your decision.</span>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {onReject && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setShowRejectDialog(true)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <X className="h-4 w-4 mr-2" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                )}
                                                {onApprove && (
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAccept}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Check className="h-4 w-4 mr-2" />
                                                        )}
                                                        Accept
                                                    </Button>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Renter Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Renter Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                                                    <img
                                                        src="/images/default-avatar.jpg"
                                                        alt={renterSnapshot?.name || "Renter"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-base truncate">
                                                        {renterSnapshot?.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        ID: {renterSnapshot?.uid}
                                                    </p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate">
                                                        {renterSnapshot?.email}
                                                    </span>
                                                </div>
                                                {renterSnapshot?.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-sm">
                                                            {renterSnapshot.phone}
                                                        </span>
                                                    </div>
                                                )}
                                                {renterSnapshot?.address && (
                                                    <div className="flex items-start gap-2">
                                                        <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm">
                                                            {renterSnapshot.address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Costume Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Costume Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="flex gap-2 flex-shrink-0">
                                                    {(costumeSnapshot?.main_images?.front || rental.costume?.main_images?.front) && (
                                                        <img
                                                            src={costumeSnapshot?.main_images?.front || rental.costume?.main_images?.front}
                                                            alt={`${costumeSnapshot?.name || rental.costume?.name} - front`}
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                    )}
                                                    {(costumeSnapshot?.main_images?.back || rental.costume?.main_images?.back) && (
                                                        <img
                                                            src={costumeSnapshot?.main_images?.back || rental.costume?.main_images?.back}
                                                            alt={`${costumeSnapshot?.name || rental.costume?.name} - back`}
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <h4 className="font-semibold truncate">
                                                        {costumeSnapshot?.name || rental.costume?.name}
                                                    </h4>
                                                    <div className="text-sm space-y-1">
                                                        {(costumeSnapshot?.brand || rental.costume?.brand) && (
                                                            <p><span className="text-muted-foreground">Brand:</span> {costumeSnapshot?.brand || rental.costume?.brand}</p>
                                                        )}
                                                        {(costumeSnapshot?.category || rental.costume?.category) && (
                                                            <p><span className="text-muted-foreground">Category:</span> {costumeSnapshot?.category || rental.costume?.category}</p>
                                                        )}
                                                        {(costumeSnapshot?.sizes || rental.costume?.sizes) && (
                                                            <p><span className="text-muted-foreground">Sizes:</span> {costumeSnapshot?.sizes || rental.costume?.sizes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Rental Price:</span>
                                                    <p className="font-semibold">
                                                        {formatCurrency(costumeSnapshot?.rental_price || rental.costume?.rental_price || 0)}/day
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Security Deposit:</span>
                                                    <p className="font-semibold">
                                                        {formatCurrency(costumeSnapshot?.security_deposit || rental.costume?.security_deposit || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Payment Summary */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Payment Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Total Amount:</span>
                                                <span className="text-sm font-semibold">
                                                    {formatCurrency(rental.total_amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Rental Amount:</span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(rental.rental_amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Security Deposit:</span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(rental.security_deposit)}
                                                </span>
                                            </div>
                                            {Number(rental.extension_fee) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Extension Fee:</span>
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {formatCurrency(rental.extension_fee)}
                                                    </span>
                                                </div>
                                            )}
                                            {Number(rental.damage_cost) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Damage Cost:</span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        {formatCurrency(rental.damage_cost)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatCurrency(rental.amount_paid)}
                                                </span>
                                            </div>
                                            {Number(rental.remaining_balance) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Remaining Balance:</span>
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {formatCurrency(rental.remaining_balance)}
                                                    </span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Payment Status:</span>
                                                <Badge
                                                    variant={rental.payment_status === 'paid' ? "default" : "destructive"}
                                                >
                                                    {rental.payment_status.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Rental Timeline */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Rental Timeline
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Start Date:</span>
                                                <span className="text-sm font-medium">{formatDate(rental.start_date)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">End Date:</span>
                                                <span className="text-sm font-medium">{formatDate(rental.end_date)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Duration:</span>
                                                <Badge variant="outline">{duration} days</Badge>
                                            </div>
                                            {rental.extended_days > 0 && (
                                                <>
                                                    <Separator />
                                                    <div className="flex justify-between items-center text-orange-600">
                                                        <span className="text-sm">Extended Days:</span>
                                                        <span className="text-sm font-medium">{rental.extended_days} days</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Delivery Method:</span>
                                                <span className="text-sm font-medium">{rental.delivery_method || "Not specified"}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Additional Information */}
                                {(rental.pickup_location || rental.special_instructions || rental.notes || rental.damage_reported) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Truck className="h-4 w-4" />
                                                Additional Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {rental.pickup_location && (
                                                <div>
                                                    <span className="text-sm text-muted-foreground">Pickup Location:</span>
                                                    <p className="text-sm font-medium mt-1">{rental.pickup_location}</p>
                                                </div>
                                            )}
                                            {rental.special_instructions && (
                                                <div>
                                                    <span className="text-sm text-muted-foreground">Special Instructions:</span>
                                                    <div className="mt-2 p-3 bg-muted rounded-lg">
                                                        <p className="text-sm">{rental.special_instructions}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {rental.notes && (
                                                <div>
                                                    <span className="text-sm text-muted-foreground">Notes:</span>
                                                    <div className="mt-2 p-3 bg-muted rounded-lg">
                                                        <p className="text-sm">{rental.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {rental.damage_reported && (
                                                <div>
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            <div className="space-y-2">
                                                                <p className="font-medium">Damage Reported</p>
                                                                {rental.initial_condition_notes && (
                                                                    <p><span className="font-medium">Initial Condition:</span> {rental.initial_condition_notes}</p>
                                                                )}
                                                                {rental.return_condition_notes && (
                                                                    <p><span className="font-medium">Return Condition:</span> {rental.return_condition_notes}</p>
                                                                )}
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Payment History */}
                                {payments && payments.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Receipt className="h-4 w-4" />
                                                Payment History ({payments.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {payments.map((payment, index) => (
                                                    <div key={`payment-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-medium text-sm">{payment.payment_type}</span>
                                                                <Badge
                                                                    variant={payment.status === 'paid' ? 'default' : 'secondary'}
                                                                    className="text-xs"
                                                                >
                                                                    {payment.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {formatDate(payment.created_at)} • Updated: {formatDate(payment.updated_at)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            {rental && `Updated: ${formatDate(rental.updated_at)}`}
                        </div>
                        <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Confirmation Dialog - Only show if onReject handler exists */}
            {onReject && (
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <X className="h-5 w-5 text-red-600" />
                                Reject Rental Request
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4">
                                    <p>Are you sure you want to reject this rental request?</p>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Rejection Message (Optional)
                                        </label>
                                        <Textarea
                                            placeholder="Provide a reason for rejecting..."
                                            value={rejectMessage}
                                            onChange={(e) => setRejectMessage(e.target.value)}
                                            className="min-h-20"
                                            maxLength={500}
                                            disabled={isUpdating}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {rejectMessage.length}/500 characters
                                        </p>
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleRejectCancel} disabled={isUpdating}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRejectConfirm}
                                disabled={isUpdating}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Request
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}