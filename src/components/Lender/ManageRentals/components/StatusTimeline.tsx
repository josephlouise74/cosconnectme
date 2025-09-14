// components/rental/StatusTimeline.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Package, RotateCw, ThumbsUp, Truck, DollarSign } from "lucide-react";

interface StatusTimelineProps {
    currentStatus: string;
    userType: 'borrower' | 'lender';
}

export function StatusTimeline({ currentStatus, userType }: StatusTimelineProps) {
    // Normalize the status to ensure consistent processing
    const normalizedStatus = currentStatus?.toLowerCase() || '';

    // Define the possible statuses in order
    const statusOrder = ['pending', 'confirmed', 'accepted', 'delivered', 'returned', 'completed'];

    // Get the current index in the status flow
    const getCurrentIndex = () => {
        const index = statusOrder.indexOf(normalizedStatus);
        // If status is not in our list (e.g., rejected, cancelled), return -1
        return index;
    };

    const getStepStatus = (step: string) => {
        const currentIndex = getCurrentIndex();
        const stepIndex = statusOrder.indexOf(step);

        // If current status is rejected or cancelled, only highlight pending and confirmed
        if (['rejected', 'cancelled'].includes(normalizedStatus)) {
            if (step === 'pending' || step === 'confirmed') {
                return "bg-green-100 text-green-600";
            }
            return "bg-gray-100 text-gray-400";
        }

        // Normal flow - highlight all steps up to and including current
        if (currentIndex >= stepIndex && currentIndex !== -1) {
            return "bg-green-100 text-green-600";
        }
        return "bg-gray-100 text-gray-400";
    };

    const getProgressWidth = (currentStep: string, nextStep: string) => {
        const currentIndex = getCurrentIndex();
        const currentStepIndex = statusOrder.indexOf(currentStep);
        const nextStepIndex = statusOrder.indexOf(nextStep);

        // If current status is rejected or cancelled, only show progress up to confirmed
        if (['rejected', 'cancelled'].includes(normalizedStatus)) {
            if (currentStepIndex < 1) { // Before 'confirmed'
                return "bg-green-500";
            }
            return "bg-gray-200";
        }

        // If we've reached or passed the next step, show progress as completed
        if (currentIndex >= nextStepIndex && currentIndex !== -1) {
            return "bg-green-500";
        }
        return "bg-gray-200";
    };

    const getStepLabels = () => {
        if (userType === 'borrower') {
            return [
                "Pending",
                "Payment Confirmed",
                "Accepted",
                "Costume Delivered",
                "Costume Returned",
                "Deposit Refunded"
            ];
        } else {
            return [
                "Pending",
                "Payment Confirmed",
                "Accepted",
                "Costume Delivered",
                "Costume Returned",
                "Payment Received"
            ];
        }
    };

    const stepLabels = getStepLabels();

    return (
        <Card className="shadow-sm border mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Rental Status Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('pending')}`}>
                        <Check className="h-4 w-4" />
                    </div>
                    <div className="flex-1 h-1">
                        <div className={`h-full ${getProgressWidth('pending', 'confirmed')}`} style={{ width: "100%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('confirmed')}`}>
                        <ThumbsUp className="h-4 w-4" />
                    </div>
                    <div className="flex-1 h-1">
                        <div className={`h-full ${getProgressWidth('confirmed', 'accepted')}`} style={{ width: "100%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('accepted')}`}>
                        <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 h-1">
                        <div className={`h-full ${getProgressWidth('accepted', 'delivered')}`} style={{ width: "100%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('delivered')}`}>
                        <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 h-1">
                        <div className={`h-full ${getProgressWidth('delivered', 'returned')}`} style={{ width: "100%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('returned')}`}>
                        <RotateCw className="h-4 w-4" />
                    </div>
                    <div className="flex-1 h-1">
                        <div className={`h-full ${getProgressWidth('returned', 'completed')}`} style={{ width: "100%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus('completed')}`}>
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{stepLabels[0]}</span>
                    <span>{stepLabels[1]}</span>
                    <span>{stepLabels[2]}</span>
                    <span>{stepLabels[3]}</span>
                    <span>{stepLabels[4]}</span>
                    <span>{stepLabels[5]}</span>
                </div>
            </CardContent>
        </Card>
    );
}