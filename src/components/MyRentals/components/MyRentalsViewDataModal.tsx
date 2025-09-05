"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetRentalDataById, useUpdateRentalRequestStatus } from "@/lib/api/rentalApi";
import { Calendar, Check, CreditCard, Loader2, MapPin, Package, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface BorrowerRentalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string | null;
}

export function BorrowerRentalDetailsModal({ isOpen, onClose, rentalId }: BorrowerRentalDetailsModalProps) {
    // Only fetch data if we have a rentalId and the modal is open
    const shouldFetch = isOpen && !!rentalId && rentalId.length > 0;

    // Fetch rental data using the updated hook with proper condition
    const {
        rental,
        costume,
        costumeSnapshot,
        renterSnapshot,
        lender,
        payments,
        paymentSummary,
        isLoading: isFetching,
        error: fetchError,
        refetch
    } = useGetRentalDataById(shouldFetch ? rentalId : "");

    // Initialize the update mutation hook
    const {
        updateStatusAsync,
        isLoading: isPending,
        error: updateError
    } = useUpdateRentalRequestStatus();

    // Handle modal closure after successful update
    useEffect(() => {
        if (!isPending && !updateError && rental?.id) {
            // If an update was successful, refetch data to reflect changes
            refetch();
        }
    }, [isPending, updateError, rental?.id, refetch]);

    // Handle accept action
    const handleAccept = async () => {
        if (costumeSnapshot?.lender_info?.uid && rental?.id) {
            try {
                await updateStatusAsync({
                    rental_id: rental.id,
                    lender_id: costumeSnapshot.lender_info.uid,
                    status: "accept"
                });
                onClose();
            } catch (error) {
                console.error("Failed to accept rental request:", error);
            }
        }
    };

    // Handle reject action
    const handleReject = async () => {
        if (costumeSnapshot?.lender_info?.uid && rental?.id) {
            try {
                await updateStatusAsync({
                    rental_id: rental.id,
                    lender_id: costumeSnapshot.lender_info.uid,
                    status: "reject",
                    reject_message: "" // Optional message
                });
                onClose();
            } catch (error) {
                console.error("Failed to reject rental request:", error);
            }
        }
    };

    // Determine if actions should be shown
    const showActionButtons = rental?.status === "pending" && costumeSnapshot?.lender_info?.uid;

    // Calculate payment summary safely using the payment_summary from API
    const totalPaid = paymentSummary?.total_paid || "0.00";
    const balanceDue = paymentSummary?.pending_amount || "0.00";
    const isFullyPaid = parseFloat(balanceDue) <= 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="h-5 w-5" />
                        Rental Details
                    </DialogTitle>
                </DialogHeader>

                {/* Loading State for Data Fetch */}
                {isFetching && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <span className="ml-2 text-sm">Loading rental details...</span>
                    </div>
                )}

                {/* Fetch Error */}
                {fetchError && (
                    <div className="text-center py-6 text-red-600 text-sm">
                        Failed to load rental details. Please try again.
                        <Button
                            onClick={() => shouldFetch && refetch()}
                            variant="outline"
                            size="sm"
                            className="ml-3"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Update Error */}
                {updateError && (
                    <div className="text-center py-3 text-red-600 text-sm">
                        Update failed: {updateError?.message || "Unknown error occurred"}
                    </div>
                )}

                {/* Main Content - Only render if data is loaded */}
                {rental && !isFetching && (
                    <div className="space-y-5">
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="text-base font-semibold">{costumeSnapshot?.name || costume?.name}</h3>
                                <p className="text-xs text-muted-foreground">Reference: {rental.reference_code}</p>
                            </div>
                            <Badge variant={rental.status === "confirmed" ? "default" : "secondary"} className="self-start sm:self-auto">
                                {rental.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Costume Details */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Package className="h-3.5 w-3.5" />
                                        Costume Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="relative w-16 h-16 overflow-hidden rounded-lg flex-shrink-0">
                                            <Image
                                                src={costumeSnapshot?.main_images?.front || costume?.main_image || "/placeholder.svg?height=100&width=100"}
                                                alt={costumeSnapshot?.name || costume?.name || "Costume"}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                                priority={false}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{costumeSnapshot?.name || costume?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">Brand: {costumeSnapshot?.brand || costume?.brand}</p>
                                            <p className="text-xs text-muted-foreground truncate">Category: {costumeSnapshot?.category || costume?.category}</p>
                                            <p className="text-xs text-muted-foreground truncate">Sizes: {costumeSnapshot?.sizes || costume?.sizes}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rental Information */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Rental Period
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Start Date:</span>
                                        <span className="text-xs font-medium">
                                            {new Date(rental.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">End Date:</span>
                                        <span className="text-xs font-medium">
                                            {new Date(rental.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Duration:</span>
                                        <span className="text-xs font-medium">
                                            {rental.duration_days} days
                                        </span>
                                    </div>
                                    {rental.extended_days > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Extended:</span>
                                            <span className="text-xs font-medium">{rental.extended_days} days</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Lender Information */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <User className="h-3.5 w-3.5" />
                                        Lender Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Name:</span>
                                        <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                            {costumeSnapshot?.lender_info?.name || lender?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Email:</span>
                                        <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                            {costumeSnapshot?.lender_info?.email || lender?.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Phone:</span>
                                        <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                            {costumeSnapshot?.lender_info?.phone || lender?.phone}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Summary */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Payment Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Total Amount:</span>
                                        <span className="text-xs font-medium">₱{rental.total_amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Total Paid:</span>
                                        <span className="text-xs font-medium text-green-600">₱{totalPaid}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Balance Due:</span>
                                        <span className="text-xs font-medium text-red-600">₱{balanceDue}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-xs text-muted-foreground">Status:</span>
                                        <Badge variant={isFullyPaid ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                                            {paymentSummary?.status || "pending"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Delivery Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Pickup Location:</span>
                                        <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                            {rental.pickup_location}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Delivery Method:</span>
                                        <span className="text-xs font-medium capitalize">
                                            {rental.delivery_method}
                                        </span>
                                    </div>
                                    {rental.special_instructions && (
                                        <div className="pt-1">
                                            <span className="text-xs text-muted-foreground block mb-1">Special Instructions:</span>
                                            <p className="text-xs p-1.5 bg-muted rounded text-wrap break-words">
                                                {rental.special_instructions}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Renter Information */}
                            {renterSnapshot && (
                                <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
                                    <CardHeader className="pb-2 pt-3">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <User className="h-3.5 w-3.5" />
                                            Renter Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Name:</span>
                                            <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                                {renterSnapshot.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Email:</span>
                                            <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                                {renterSnapshot.email}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Phone:</span>
                                            <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                                {renterSnapshot.phone}
                                            </span>
                                        </div>
                                        {renterSnapshot.address && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground">Address:</span>
                                                <span className="text-xs font-medium text-right max-w-[60%] truncate">
                                                    {renterSnapshot.address}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Action Buttons - Render only if actionable */}
                        {showActionButtons && (
                            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                                <Button
                                    onClick={handleReject}
                                    variant="destructive"
                                    size="sm"
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 text-xs h-8"
                                >
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <X className="h-3.5 w-3.5" />
                                    Reject Request
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    size="sm"
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 text-xs h-8"
                                >
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <Check className="h-3.5 w-3.5" />
                                    Accept Request
                                </Button>
                            </div>
                        )}

                        {/* Close button - always shown */}
                        <div className="flex justify-end pt-3 border-t">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}

                {/* No Data State - Show when not loading and no data is available */}
                {!isFetching && !rental && !fetchError && (
                    <div className="py-6 text-center">
                        <p className="text-sm text-muted-foreground">No rental details available.</p>
                        <Button onClick={onClose} variant="outline" size="sm" className="mt-3 text-xs">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}