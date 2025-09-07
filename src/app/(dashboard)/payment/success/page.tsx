"use client";
import { Button } from "@/components/ui/button";
import { useConfirmPayment } from "@/lib/api/rentalApi";
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SuccessPaymentPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get("reference");
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { confirmPayment, data, error: networkError, isLoading } =
        useConfirmPayment();

    // Initial API call to confirm payment
    useEffect(() => {
        if (reference && !data) {
            confirmPayment({ reference });
        }
    }, [reference, confirmPayment, data]);

    // Handle "already paid" redirect
    useEffect(() => {
        if (data?.success && data.message?.includes("already been confirmed")) {
            // Set redirecting state first to show the UI
            setIsRedirecting(true);

            // Delay the redirect slightly to allow the UI to render
            const redirectTimer = setTimeout(() => {
                router.push("/my-rentals");
            }, 2000);

            return () => clearTimeout(redirectTimer);
        }
        return
    }, [data, router]);

    // If there's no reference, show error
    if (!reference) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="flex justify-center">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Invalid Payment Reference
                    </h1>
                    <p className="text-muted-foreground">
                        Missing payment reference information. Please try again.
                    </p>
                    <Button asChild className="w-full mt-4">
                        <Link href="/">Return to Dashboard</Link>
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

    // Network error
    if (networkError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <AlertTriangle className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-red-500">
                            Confirmation Failed
                        </h1>
                        <p className="text-muted-foreground">
                            We couldn't confirm your payment due to a network error. Please try again or contact support.
                        </p>
                        <p className="text-sm text-red-400">
                            Error: {networkError.message || "Unknown network error"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button asChild className="w-full">
                            <Link href="/">Return to Dashboard</Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/support">Contact Support</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle API response
    if (data) {
        // If payment wasn't successful
        if (!data.success) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <AlertTriangle className="w-16 h-16 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-red-500">
                                Payment Confirmation Failed
                            </h1>
                            <p className="text-muted-foreground">
                                {data.message || "We couldn't verify your payment. Please contact support for assistance."}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 mt-6">
                            <Button asChild className="w-full">
                                <Link href="/">Return to Dashboard</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/support">Contact Support</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // Handle already paid case with redirecting state (controlled by the useEffect)
        if (isRedirecting || data.message?.includes("already been confirmed")) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-blue-500" />
                            </div>
                            <div className="flex justify-center mt-2">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Payment Already Confirmed
                            </h1>
                            <p className="text-muted-foreground">
                                Your payment has already been processed. Redirecting you to your rentals...
                            </p>

                            {/* Show minimal payment details */}
                            {data.data && (
                                <div className="bg-blue-50 p-4 rounded-lg mt-2">
                                    <p className="font-medium text-sm text-blue-700">Payment Details</p>
                                    <div className="text-xs text-left mt-1 space-y-1 text-blue-800">
                                        <p>Reference: {data.data.reference_code || "N/A"}</p>
                                        <p>Costume: {data.data.rental?.costume_name || "N/A"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* No buttons during redirect */}
                    </div>
                </div>
            );
        }

        // Success state (new confirmation)
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
                                <Link href="/costumes">Browse More Costumes</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex justify-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Something Went Wrong
                </h1>
                <p className="text-muted-foreground">
                    Please refresh the page or contact support if the issue persists.
                </p>
                <Button asChild className="w-full">
                    <Link href="/">Return to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
};

export default SuccessPaymentPage;