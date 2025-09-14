"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useGetRentalDataById } from "@/lib/api/rentalApi"
import { cn } from "@/lib/utils"
import {
    AlertCircle,
    Calendar,
    Clock,
    CreditCard,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Receipt,
    ShoppingBag,
    User
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import DamageReportDialog from "./DamageReportDialog"
import RejectRentalDialog from "./RejectDialog"
import RentalStatusDropdown from "./RentalStatusDropDown"
import { StatusTimeline } from "./StatusTimeline"

interface LenderRentalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string | null;
    onApprove?: (rentalId: string) => void | Promise<void>;
    onReject?: (rentalId: string, message: string) => void | Promise<void>;
    onMarkAsDelivered?: (rentalId: string) => void | Promise<void>;
    onMarkAsReturned?: (rentalId: string, returnNotes?: string) => void | Promise<void>;
    onReportDamage?: (rentalId: string, damageDetails: { cost: number; description: string }) => void | Promise<void>;
    isUpdating?: boolean;
    updateError?: any;
}

// Status configuration
const STATUS_CONFIG = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'PENDING' },
    confirmed: { color: 'bg-blue-100 text-blue-800', label: 'CONFIRMED' },
    accepted: { color: 'bg-green-100 text-green-800', label: 'ACCEPTED' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'DELIVERED' },
    returned: { color: 'bg-purple-100 text-purple-800', label: 'RETURNED' },
    completed: { color: 'bg-gray-100 text-gray-800', label: 'COMPLETED' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'CANCELLED' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'REJECTED' },
    overdue: { color: 'bg-orange-100 text-orange-800', label: 'OVERDUE' },
};

const PAYMENT_STATUS_CONFIG = {
    paid: 'bg-green-100 text-green-800',
    fully_paid: 'bg-green-100 text-green-800',
    partially_paid: 'bg-yellow-100 text-yellow-800',
    unpaid: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
};

export function LenderRentalDetailsModal({
    isOpen,
    onClose,
    rentalId,
    onApprove,
    onReject,
    onMarkAsDelivered,
    onMarkAsReturned,
    onReportDamage,
    isUpdating = false,
    updateError
}: LenderRentalDetailsModalProps) {
    // Dialog state
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showDamageDialog, setShowDamageDialog] = useState(false);

    // Data fetching
    const {
        isLoading: loadingDetails,
        error,
        rental,
        costumeSnapshot,
        renterSnapshot,
        payments,
        paymentSummary,

    } = useGetRentalDataById(rentalId || "");

    // Reset state when modal closes or rental ID changes
    useEffect(() => {
        if (!isOpen || !rentalId) {
            setShowRejectDialog(false);
            setShowDamageDialog(false);
        }
    }, [isOpen, rentalId]);

    // Early return if no rental ID
    if (!rentalId) return null;

    // Rental status logic
    const rentalStatus = rental?.status?.toLowerCase() || '';
    const canAcceptReject = rentalStatus === "confirmed";
    const canMarkAsDelivered = rentalStatus === "accepted";
    const canMarkAsReturned = rentalStatus === "delivered";

    // Check if rental is overdue
    const isOverdue = rental && new Date(rental.end_date) < new Date() &&
        (rentalStatus === 'delivered' || rentalStatus === 'overdue');
    const daysOverdue = isOverdue && rental ?
        Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Action handlers
    const handleAccept = async () => {
        if (!onApprove || !rentalId) return;
        try {
            console.log("Accepting rental:", rentalId);
            await onApprove(rentalId);
            window.location.reload();
        } catch (error) {
            console.error("Error accepting rental:", error);
        }
    };

    const handleRejectConfirm = async (message: string) => {
        if (!onReject || !rentalId) return;
        try {
            console.log("Rejecting rental:", rentalId, "with message:", message);
            await onReject(rentalId, message);
            setShowRejectDialog(false);
            window.location.reload();
        } catch (error) {
            console.error("Error rejecting rental:", error);
        }
    };

    const handleMarkAsDelivered = async () => {
        if (!onMarkAsDelivered || !rentalId) return;
        try {
            console.log("Marking rental as delivered:", rentalId);
            await onMarkAsDelivered(rentalId);
            window.location.reload();
        } catch (error) {
            console.error("Error marking rental as delivered:", error);
        }
    };

    const handleReturnIntact = async () => {
        if (!onMarkAsReturned || !rentalId) return;
        try {
            console.log("Marking rental as returned (intact):", rentalId);
            await onMarkAsReturned(rentalId, "Item returned in good condition");
            window.location.reload();
        } catch (error) {
            console.error("Error marking rental as returned:", error);
        }
    };

    const handleReturnDamaged = () => {
        setShowDamageDialog(true);
    };

    const handleDamageReportSubmit = async (damageDetails: { cost: number; description: string }) => {
        if (!onReportDamage || !rentalId) return;
        try {
            console.log("Submitting damage report:", rentalId, damageDetails);
            await onReportDamage(rentalId, damageDetails);
            setShowDamageDialog(false);
            window.location.reload();
        } catch (error) {
            console.error("Error reporting damage:", error);
        }
    };

    // Utility functions
    const getStatusColor = (status: string): string => {
        return STATUS_CONFIG[status?.toLowerCase() as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string): string => {
        return PAYMENT_STATUS_CONFIG[status?.toLowerCase() as keyof typeof PAYMENT_STATUS_CONFIG] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: string | number): string => {
        const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return `₱${numAmount.toLocaleString()}`;
    };

    // Component for detail items
    const DetailItem = ({
        label,
        value,
        icon,
        className
    }: {
        label: string;
        value: React.ReactNode;
        icon?: React.ReactNode;
        className?: string;
    }) => (
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
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center">
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
                            </DialogTitle>
                            {/* Action Dropdown Menu */}
                            {!loadingDetails && !error && rental && (
                                <RentalStatusDropdown
                                    isUpdating={isUpdating}
                                    canAcceptReject={canAcceptReject}
                                    canMarkAsDelivered={canMarkAsDelivered}
                                    canMarkAsReturned={canMarkAsReturned}
                                    onAccept={handleAccept}
                                    onOpenRejectDialog={() => setShowRejectDialog(true)}
                                    onMarkAsDelivered={handleMarkAsDelivered}
                                    onReturnIntact={handleReturnIntact}
                                    onReturnDamaged={handleReturnDamaged}
                                    onClose={onClose}
                                    rentalStatus={rental.status || ''}
                                />
                            )}
                        </div>
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
                                        <Badge className={cn("text-xs px-3 py-1", getStatusColor(rentalStatus))}>
                                            {STATUS_CONFIG[rentalStatus as keyof typeof STATUS_CONFIG]?.label || rentalStatus.toUpperCase()}
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
                                        {rental?.damage_reported && (
                                            <Badge variant="destructive" className="text-xs px-3 py-1 bg-amber-100 text-amber-800 border-amber-200">
                                                DAMAGE REPORTED
                                            </Badge>
                                        )}
                                    </div>
                                    {updateError && (
                                        <Alert variant="destructive" className="mb-6">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {typeof updateError === 'string'
                                                    ? updateError
                                                    : 'Failed to update rental status. Please try again.'}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Status Timeline - Using the separated component */}
                                    {rentalStatus !== "pending" && <StatusTimeline currentStatus={rentalStatus} userType="lender" />}

                                    {/* Main content grid */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {/* Left Column - Costume & Renter Info */}
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
                                        {/* Right Column - Rental & Payment Details */}
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
                                                            icon={<MapPin className="h-4 w-4" />}
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
                                                        {rental?.damage_cost && Number(rental.damage_cost) > 0 && (
                                                            <DetailItem
                                                                label="Damage Cost"
                                                                value={<span className="text-red-600 font-semibold">- {formatCurrency(rental.damage_cost)}</span>}
                                                            />
                                                        )}
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
                                                                value={<span className="font-semibold text-orange-600">{formatCurrency(rental.extension_fee || 0)}</span>}
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
                                                            value={<span className="font-semibold text-red-600">{formatCurrency(rental.damage_cost || 0)}</span>}
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
            {/* Reject and Damage Report Dialogs */}
            <RejectRentalDialog
                isOpen={showRejectDialog}
                onClose={() => setShowRejectDialog(false)}
                onConfirm={handleRejectConfirm}
                isUpdating={isUpdating}
            />
            <DamageReportDialog
                isOpen={showDamageDialog}
                onClose={() => setShowDamageDialog(false)}
                onSubmit={handleDamageReportSubmit}
                isUpdating={isUpdating}
                securityDeposit={rental?.security_deposit as any || 0}
            />
        </>
    );
}