import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertTriangle,
    Check,
    ChevronDown,
    Loader2,
    MoreHorizontal,
    Package,
    X
} from "lucide-react";

interface RentalStatusDropdownProps {
    isUpdating: boolean;
    canAcceptReject: boolean;        // When status is "confirmed"
    canMarkAsDelivered: boolean;     // When status is "accepted"
    canMarkAsReturned: boolean;      // When status is "delivered"
    onAccept: () => void | Promise<void>;
    onOpenRejectDialog: () => void;
    onMarkAsDelivered: () => void | Promise<void>;
    onReturnIntact: () => void | Promise<void>;
    onReturnDamaged: () => void;
    onClose: () => void;
    rentalStatus: string;
}

export default function RentalStatusDropdown({
    isUpdating,
    canAcceptReject,
    canMarkAsDelivered,
    canMarkAsReturned,
    onAccept,
    onOpenRejectDialog,
    onMarkAsDelivered,
    onReturnIntact,
    onReturnDamaged,
    onClose,
    rentalStatus
}: RentalStatusDropdownProps) {
    // Normalize the status for consistent checking
    const normalizedStatus = rentalStatus?.toLowerCase() || '';

    // Determine available actions based on current status
    const showAcceptReject = normalizedStatus === 'confirmed';
    const showMarkAsDelivered = normalizedStatus === 'accepted';
    const showMarkAsReturned = normalizedStatus === 'delivered';

    // Log for debugging
    console.log("Rendering action menu with status:", normalizedStatus, {
        showAcceptReject,
        showMarkAsDelivered,
        showMarkAsReturned,
        canAcceptReject,
        canMarkAsDelivered,
        canMarkAsReturned
    });

    // Check if any actions are available
    const hasActions = (showAcceptReject && canAcceptReject) ||
        (showMarkAsDelivered && canMarkAsDelivered) ||
        (showMarkAsReturned && canMarkAsReturned);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    className="h-9 px-3 font-medium"
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4 mr-1.5" />
                    )}
                    Actions
                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Accept/Reject Actions - When status is "confirmed" */}
                {showAcceptReject && canAcceptReject && (
                    <>
                        <DropdownMenuLabel className="text-xs">
                            Rental Request
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={onAccept}
                            disabled={isUpdating}
                            className="text-sm cursor-pointer text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Accept Request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                console.log("Opening reject dialog");
                                onOpenRejectDialog();
                            }}
                            disabled={isUpdating}
                            className="text-sm cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject Request
                        </DropdownMenuItem>
                    </>
                )}

                {/* Mark as Delivered - When status is "accepted" */}
                {showMarkAsDelivered && canMarkAsDelivered && (
                    <>
                        {showAcceptReject && canAcceptReject && <DropdownMenuSeparator />}
                        <DropdownMenuLabel className="text-xs">
                            Delivery Status
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={onMarkAsDelivered}
                            disabled={isUpdating}
                            className="text-sm cursor-pointer text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Mark as Delivered
                        </DropdownMenuItem>
                    </>
                )}

                {/* Return Actions - When status is "delivered" */}
                {showMarkAsReturned && canMarkAsReturned && (
                    <>
                        {(showAcceptReject || showMarkAsDelivered) && <DropdownMenuSeparator />}
                        <DropdownMenuLabel className="text-xs">
                            Return Process
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={onReturnIntact}
                            disabled={isUpdating}
                            className="text-sm cursor-pointer text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Return - No Damage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onReturnDamaged}
                            disabled={isUpdating}
                            className="text-sm cursor-pointer text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Return - Report Damage
                        </DropdownMenuItem>
                    </>
                )}

                {/* No actions available */}
                {!hasActions && (
                    <>
                        <DropdownMenuLabel className="text-xs">
                            Status: {normalizedStatus.toUpperCase()}
                        </DropdownMenuLabel>
                        <DropdownMenuItem disabled className="text-sm text-gray-500">
                            No actions available for this status
                        </DropdownMenuItem>
                    </>
                )}

                {/* Always show close option */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        console.log("Closing rental details");
                        onClose();
                    }}
                    className="text-sm cursor-pointer hover:bg-gray-50"
                >
                    Close Details
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}