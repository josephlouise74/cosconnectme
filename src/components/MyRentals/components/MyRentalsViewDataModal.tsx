"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetRentalDataById, useUpdateRentalRequest } from "@/lib/api/rentalApi";
import { Calendar, Check, CreditCard, Loader2, MapPin, Package, User, X } from "lucide-react";
import { useEffect } from "react"; // Added for local error state and effects if needed

interface BorrowerRentalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string | null;
}

export function BorrowerRentalDetailsModal({ isOpen, onClose, rentalId }: BorrowerRentalDetailsModalProps) {
    // Fetch rental data as before
    const { data, isLoading: isFetching, error: fetchError, refetch } = useGetRentalDataById(rentalId as string || "");

    // Initialize the update mutation hook
    const { acceptRentalRequest, rejectRentalRequest, isPending, error: updateError } = useUpdateRentalRequest();

    // Handle modal closure after successful update (best practice: automatically close on success to provide feedback and refresh)
    useEffect(() => {
        if (!isPending && !updateError && data?.success) {
            // If an update was successful, refetch data to reflect changes or close modal
            // Note: The hook's onSuccess already invalidates the query, so refetch will be triggered
            onClose(); // Close modal after successful update for better UX
        }
    }, [isPending, updateError, data?.success, onClose]);

    // Early return if no rentalId
    if (!rentalId) return null;

    // Destructure once for clarity
    const rental = data?.data?.rental;
    const costume = data?.data?.costume;
    const lender = data?.data?.lender;
    const paymentSummary = data?.data?.payment_summary;

    // Handle accept action
    const handleAccept = async () => {
        if (lender?.uid && rental?.id) {
            // Use the helper from the hook (no need for custom toast/error handling here, as it's in the hook)
            acceptRentalRequest(rental.id, lender.uid, ""); // Pass empty string if no reason; hook handles optional reason
        }
    };

    // Handle reject action
    const handleReject = async () => {
        if (lender?.uid && rental?.id) {
            // Use the helper from the hook
            rejectRentalRequest(rental.id, lender.uid, ""); // Same as above
        }
    };

    // Determine if actions should be shown (e.g., only if it's a lender view and rental is in 'pending' status)
    // This is a UX best practice: only show buttons if actionable; adjust based on your app's logic
    const showActionButtons = rental?.status === "pending" && lender?.uid;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Rental Details
                    </DialogTitle>
                </DialogHeader>

                {/* Loading State for Data Fetch */}
                {isFetching && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading rental details...</span>
                    </div>
                )}

                {/* Fetch Error */}
                {fetchError && (
                    <div className="text-center py-8 text-red-600">
                        Failed to load rental details. Please try again.
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                            className="ml-4"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Update Error */}
                {updateError && (
                    <div className="text-center py-4 text-red-600">
                        Update failed: {updateError?.response?.data?.error || "Unknown error occurred"}
                    </div>
                )}

                {/* Main Content - Only render if data is loaded */}
                {rental && !isFetching && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{costume?.name}</h3>
                                <p className="text-sm text-muted-foreground">Reference: {rental.reference_code}</p>
                            </div>
                            <Badge variant={rental.status === "confirmed" ? "default" : "secondary"}>
                                {rental.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <img
                                            src={costume?.main_images?.front || "/placeholder.svg?height=100&width=100"}
                                            alt={costume?.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{costume?.name}</p>
                                            <p className="text-sm text-muted-foreground">Brand: {costume?.brand}</p>
                                            <p className="text-sm text-muted-foreground">Category: {costume?.category}</p>
                                            <p className="text-sm text-muted-foreground">Sizes: {costume?.sizes}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rental Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Rental Period
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Start Date:</span>
                                        <span className="text-sm font-medium">{rental.start_date_formatted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">End Date:</span>
                                        <span className="text-sm font-medium">{rental.end_date_formatted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Duration:</span>
                                        <span className="text-sm font-medium">{rental.duration_days} days</span>
                                    </div>
                                    {rental.is_overdue && (
                                        <div className="flex justify-between text-red-600">
                                            <span className="text-sm">Overdue:</span>
                                            <span className="text-sm font-medium">{rental.days_overdue} days</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Lender Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Lender Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Name:</span>
                                        <span className="text-sm font-medium">{lender?.display_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Email:</span>
                                        <span className="text-sm font-medium">{lender?.contact_email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Phone:</span>
                                        <span className="text-sm font-medium">{lender?.contact_phone}</span>
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
                                        <span className="text-sm font-medium">₱{rental.total_amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Paid:</span>
                                        <span className="text-sm font-medium text-green-600">₱{paymentSummary?.total_paid}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Balance Due:</span>
                                        <span className="text-sm font-medium text-red-600">₱{paymentSummary?.balance_due}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Payment Status:</span>
                                        <Badge variant={paymentSummary?.is_fully_paid ? "default" : "destructive"}>
                                            {paymentSummary?.is_fully_paid ? "Fully Paid" : "Pending"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Delivery Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Pickup Location:</span>
                                    <span className="text-sm font-medium">{rental.pickup_location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Delivery Method:</span>
                                    <span className="text-sm font-medium">{rental.delivery_method}</span>
                                </div>
                                {rental.special_instructions && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Special Instructions:</span>
                                        <p className="text-sm mt-1 p-2 bg-muted rounded">{rental.special_instructions}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons - Render only if actionable (clean conditional rendering) */}
                        {showActionButtons && (
                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button
                                    onClick={handleReject}
                                    variant="destructive"
                                    disabled={isPending}
                                    className="flex items-center gap-2"
                                >
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <X className="h-4 w-4" />
                                    Reject Request
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    disabled={isPending}
                                    className="flex items-center gap-2"
                                >
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Check className="h-4 w-4" />
                                    Accept Request
                                </Button>
                                <Button onClick={onClose} variant="outline">
                                    Close
                                </Button>
                            </div>
                        )}

                        {/* Fallback: If no actions, just show Close */}
                        {!showActionButtons && (
                            <div className="flex justify-end pt-4">
                                <Button onClick={onClose}>Close</Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}