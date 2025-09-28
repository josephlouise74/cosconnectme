"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Shield, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface OTPDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
    email: string;
    onResendOTP?: () => Promise<{ success: boolean; message?: string }>;
    isLoading?: boolean;
}

const OTPDialog = ({
    isOpen,
    onClose,
    onVerify,
    email,
    onResendOTP,
    isLoading = false
}: OTPDialogProps) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Start countdown when dialog opens
    useEffect(() => {
        if (isOpen) {
            setCountdown(60); // 60 seconds countdown
            setOtp(['', '', '', '', '', '']);
        }
    }, [isOpen]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Focus first input when dialog opens
    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
        }
    }, [isOpen]);

    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        if (value.length <= 1) {
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Enter') {
            handleVerifyOTP();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (pastedData.length === 6) {
            const newOtp = pastedData.split('').slice(0, 6);
            setOtp(newOtp);
            // Focus the last input
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerifyOTP = useCallback(async () => {
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        try {
            const result = await onVerify(otpString);
            if (result.success) {
                // Don't show success toast here - let the parent handle it
                // The dialog will be closed by the parent component after successful verification
            } else {
                toast.error(result.message || 'Invalid OTP. Please try again.');
                // Clear OTP on failure
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            toast.error('Failed to verify OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    }, [otp, onVerify]);

    const handleResendOTP = useCallback(async () => {
        if (!onResendOTP || countdown > 0) return;

        setIsResending(true);
        try {
            const result = await onResendOTP();
            if (result.success) {
                toast.success('New verification code sent to your email!');
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(result.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    }, [onResendOTP, countdown]);

    const handleDialogClose = useCallback(() => {
        // Reset all states when closing
        setOtp(['', '', '', '', '', '']);
        setIsVerifying(false);
        setIsResending(false);
        setCountdown(0);
        onClose();
    }, [onClose]);

    const isOTPComplete = otp.every(digit => digit !== '');
    const isAnyLoading = isVerifying || isResending || isLoading;

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-semibold">
                        Enter Verification Code
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        We've sent a 6-digit verification code to{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center space-x-3">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el: any) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className={cn(
                                    "h-12 w-12 text-center text-lg font-semibold",
                                    "border-2 transition-colors",
                                    digit
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/20 focus:border-primary"
                                )}
                                disabled={isAnyLoading}
                            />
                        ))}
                    </div>

                    {/* Timer and Resend */}
                    <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the code? Resend in{" "}
                                <span className="font-medium text-primary">{countdown}s</span>
                            </p>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResendOTP}
                                disabled={isAnyLoading}
                                className="text-primary hover:text-primary/80"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend Code
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={handleVerifyOTP}
                        disabled={!isOTPComplete || isAnyLoading}
                        className="w-full h-11"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify & Continue"
                        )}
                    </Button>

                    {/* Cancel Button */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDialogClose}
                        disabled={isAnyLoading}
                        className="w-full"
                    >
                        Cancel
                    </Button>

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Having trouble? Check your spam folder or contact support
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OTPDialog;