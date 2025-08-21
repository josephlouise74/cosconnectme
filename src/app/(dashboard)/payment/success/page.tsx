import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const SuccessPaymentPage = () => {
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
                            <Link href="/">
                                Go to Dashboard
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