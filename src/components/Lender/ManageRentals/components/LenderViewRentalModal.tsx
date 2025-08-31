"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
    ExternalLink,
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

    // Data fetching - only for display
    const { data, isLoading: loadingDetails, error } = useGetRentalDataById(rentalId || "")

    if (!rentalId) return null

    // Extract data
    const rental = data?.data?.rental
    const renter = data?.data?.renter
    const paymentSummary = data?.data?.payment_summary
    const paymentHistory = data?.data?.payment_history || []
    const metadata = data?.data?.metadata

    // UI state
    const canUpdateStatus = metadata?.can_cancel && rental?.status === "confirmed"

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
        return `₱${amount || '0'}`
    }

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
                                                    {rental.costume_snapshot?.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Reference: <span className="font-mono">{rental.reference_code}</span>
                                                </p>
                                                <div className="flex items-center gap-2 text-sm flex-wrap">
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {rental.start_date_formatted} → {rental.end_date_formatted}
                                                    </span>
                                                    <Badge variant="outline" className="flex-shrink-0">
                                                        {rental.duration_days} days
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
                                                {rental.is_overdue && (
                                                    <Badge variant="destructive" className="w-fit">
                                                        Overdue by {rental.days_overdue} days
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
                                                        src={renter?.profile_image || "/images/default-avatar.jpg"}
                                                        alt={renter?.display_name || "Renter"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-base truncate">
                                                        {renter?.display_name || rental.renter_snapshot?.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        @{renter?.username || "user"}
                                                    </p>
                                                    {renter?.status && (
                                                        <Badge
                                                            variant={renter.status === 'active' ? 'default' : 'secondary'}
                                                            className="mt-1"
                                                        >
                                                            {renter.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate">
                                                        {renter?.email || rental.renter_snapshot?.email}
                                                    </span>
                                                </div>
                                                {(renter?.phone_number || rental.renter_snapshot?.phone) && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-sm">
                                                            {renter?.phone_number || rental.renter_snapshot?.phone}
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
                                                    {rental.costume_snapshot?.main_images?.front && (
                                                        <img
                                                            src={rental.costume_snapshot.main_images.front}
                                                            alt={`${rental.costume_snapshot?.name} - front`}
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                    )}
                                                    {rental.costume_snapshot?.main_images?.back && (
                                                        <img
                                                            src={rental.costume_snapshot.main_images.back}
                                                            alt={`${rental.costume_snapshot?.name} - back`}
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <h4 className="font-semibold truncate">
                                                        {rental.costume_snapshot?.name}
                                                    </h4>
                                                    <div className="text-sm space-y-1">
                                                        {rental.costume_snapshot?.brand && (
                                                            <p><span className="text-muted-foreground">Brand:</span> {rental.costume_snapshot.brand}</p>
                                                        )}
                                                        {rental.costume_snapshot?.category && (
                                                            <p><span className="text-muted-foreground">Category:</span> {rental.costume_snapshot.category}</p>
                                                        )}
                                                        {rental.costume_snapshot?.sizes && (
                                                            <p><span className="text-muted-foreground">Sizes:</span> {rental.costume_snapshot.sizes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Rental Price:</span>
                                                    <p className="font-semibold">
                                                        {formatCurrency(rental.costume_snapshot?.rental_price)}/day
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Security Deposit:</span>
                                                    <p className="font-semibold">
                                                        {formatCurrency(rental.costume_snapshot?.security_deposit)}
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
                                                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatCurrency(paymentSummary?.total_paid as string)}
                                                </span>
                                            </div>
                                            {Number(paymentSummary?.pending_amount) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Pending:</span>
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {formatCurrency(paymentSummary?.pending_amount as string)}
                                                    </span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Status:</span>
                                                <Badge
                                                    variant={paymentSummary?.is_fully_paid ? "default" : "destructive"}
                                                >
                                                    {paymentSummary?.is_fully_paid ? "Fully Paid" : "Payment Required"}
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
                                                <span className="text-sm font-medium">{rental.start_date_formatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">End Date:</span>
                                                <span className="text-sm font-medium">{rental.end_date_formatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Duration:</span>
                                                <Badge variant="outline">{rental.duration_days} days</Badge>
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
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Additional Information */}
                                {(rental.pickup_location || rental.special_instructions || rental.notes) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Truck className="h-4 w-4" />
                                                Delivery & Instructions
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
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Payment History */}
                                {paymentHistory.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Receipt className="h-4 w-4" />
                                                Payment History ({paymentHistory.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {paymentHistory.map((payment, index) => (
                                                    <div key={`payment-${payment.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-medium text-sm">{payment.description}</span>
                                                                <Badge
                                                                    variant={payment.status === 'paid' ? 'default' : 'secondary'}
                                                                    className="text-xs"
                                                                >
                                                                    {payment.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {payment.created_at_formatted} • {payment.payment_method}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end flex-shrink-0">
                                                            <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                                                            {payment.checkout_url && (
                                                                <a
                                                                    href={payment.checkout_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs flex items-center text-blue-600 hover:underline mt-1"
                                                                >
                                                                    View <ExternalLink className="ml-1 h-3 w-3" />
                                                                </a>
                                                            )}
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