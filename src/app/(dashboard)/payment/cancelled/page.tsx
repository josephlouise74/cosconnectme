import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

const CancelledPaymentPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="w-16 h-16 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Payment Cancelled
                    </h1>
                    <p className="text-muted-foreground">
                        Your costume rental payment was cancelled. No charges have been made to your account.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">What Happened?</p>
                        <ul className="text-sm text-muted-foreground space-y-2 text-left">
                            <li className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span>Payment process was interrupted or cancelled</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span>No charges were made to your account</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span>Your rental request is still pending</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                Return to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/costumes">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelledPaymentPage;