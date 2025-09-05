"use client";
import { Button } from "@/components/ui/button";
import { useConfirmPayment } from "@/lib/api/rentalApi";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SuccessPaymentPage = () => {
    const searchParams = useSearchParams();
    // Get reference from URL query params
    const reference = searchParams.get('reference');
    const [paymentDetails, setPaymentDetails] = useState<any>(null);
    const { confirmPayment, data, error, isLoading } = useConfirmPayment();
    console.log("payment ", paymentDetails)
    console.log("payment ", reference)
    useEffect(() => {
        // Only call the API if we have reference
        if (reference) {
            confirmPayment({
                reference
            });
        }
    }, [reference, confirmPayment]);

    useEffect(() => {
        if (data && !isLoading) {
            setPaymentDetails(data.data as any);
        }
    }, [data, isLoading]);

    // If there's no reference, show error
    if (!reference) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <p className="text-red-500">Missing payment reference information. Please try again.</p>
                    <Button asChild className="w-full">
                        <Link href="/">
                            Return to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Confirming Payment...
                        </h1>
                        <p className="text-muted-foreground">
                            Please wait while we verify your payment.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold tracking-tight text-red-500">
                            Payment Verification Failed
                        </h1>
                        <p className="text-muted-foreground">
                            We couldn't verify your payment. Please contact support for assistance.
                        </p>
                        <p className="text-sm text-red-400">
                            Error: {error.message || "Unknown error occurred"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button asChild className="w-full">
                            <Link href="/">
                                Return to Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/support">
                                Contact Support
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground">
                        Your costume rental payment has been processed successfully. You can now view your rental details in your dashboard.
                    </p>
                    {/* Show payment details if available */}
                    {paymentDetails && (
                        <div className="bg-green-50 p-4 rounded-lg mt-4">
                            <p className="font-medium text-sm text-green-700">Payment Details</p>
                            <div className="text-xs text-left mt-2 space-y-1 text-green-800">
                                <p>Reference: {paymentDetails.reference_code}</p>
                                <p>Amount: ₱{paymentDetails.payment_details.amount}</p>
                                <p>Method: {paymentDetails.payment_details.payment_method}</p>
                                <p>Date: {new Date(paymentDetails.payment_details.processed_at).toLocaleString()}</p>
                                <p>Costume: {paymentDetails.rental.costume_name}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">What's Next?</p>
                        <ul className="text-sm text-muted-foreground space-y-2 text-left">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Check your email for payment confirmation</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>View your rental details in the dashboard</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Prepare for costume pickup on the scheduled date</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/dashboard/rentals">
                                View My Rentals
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/costumes">
                                Browse More Costumes
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPaymentPage;