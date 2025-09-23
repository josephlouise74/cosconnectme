import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/SocialFeed/components/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface RejectRentalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (message: string) => void | Promise<void>;
    isUpdating: boolean;
    error?: string | null;
}

export default function RejectRentalDialog({
    isOpen,
    onClose,
    onConfirm,
    isUpdating,
    error
}: RejectRentalDialogProps) {
    const [rejectMessage, setRejectMessage] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset message when dialog opens
    useEffect(() => {
        if (isOpen) {
            setRejectMessage("");
            setValidationError(null);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!rejectMessage.trim()) {
            setValidationError("Please provide a reason for rejecting this rental request.");
            return;
        }

        setValidationError(null);
        await onConfirm(rejectMessage.trim());
    };

    const handleCancel = () => {
        setRejectMessage("");
        setValidationError(null);
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-base">Reject Rental Request</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Please provide a reason for rejecting this rental request. This message will be sent to the renter.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectMessage}
                        onChange={(e) => {
                            setRejectMessage(e.target.value);
                            if (validationError) setValidationError(null);
                        }}
                        className={`min-h-[100px] resize-none text-sm ${validationError || error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isUpdating}
                    />
                    {validationError && (
                        <p className="text-red-500 text-xs mt-1">{validationError}</p>
                    )}
                    {error && !validationError && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                </div>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-2">
                    <AlertDialogCancel
                        onClick={handleCancel}
                        className="mt-2 sm:mt-0 text-xs h-9"
                        disabled={isUpdating}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isUpdating || !rejectMessage.trim()}
                        className="w-full sm:w-auto text-xs h-9"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Confirm Rejection"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}