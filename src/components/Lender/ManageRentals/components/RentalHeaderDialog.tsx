// components/rentals/lender-rental-details/RentalHeader.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, Check, X, Loader2 } from "lucide-react"
import { formatDate, getStatusColor } from "./utils"

interface RentalHeaderProps {
    rental: any
    costumeSnapshot: any
    paymentSummary: {
        total_paid: any
        pending_amount: any
        is_fully_paid: boolean
    } | null
    isOverdue: boolean
    daysOverdue: number
    duration: number
    canUpdateStatus: boolean
    isUpdating: boolean
    onApprove?: (rentalId: string) => void | Promise<void>
    onReject?: (rentalId: string, message?: string) => void | Promise<void>
    setShowRejectDialog: (show: boolean) => void
}

export function RentalHeader({
    rental,
    costumeSnapshot,
    paymentSummary,
    isOverdue,
    daysOverdue,
    duration,
    canUpdateStatus,
    isUpdating,
    onApprove,
    onReject,
    setShowRejectDialog
}: RentalHeaderProps) {
    if (!rental) return null;

    return (
        <>
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
                            {onApprove && rental && (
                                <Button
                                    size="sm"
                                    onClick={() => onApprove(rental.id)}
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
        </>
    )
}