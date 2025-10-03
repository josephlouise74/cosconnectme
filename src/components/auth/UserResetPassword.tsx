"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, COLORS, TYPOGRAPHY } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { resetPassword } from "../../../actions/auth";

const ResetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

const UserResetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        },
    });

    useEffect(() => {
        setIsMounted(true);
        // Check if we have the reset code in the URL
        const code = searchParams.get('code');
        if (!code) {
            setErrorMessage("Invalid or missing reset code. Please request a new password reset link.");
        }
    }, [searchParams]);

    const onSubmit = useCallback(async (values: ResetPasswordData) => {
        setIsLoading(true);
        setErrorMessage(null);

        const code = searchParams.get('code');
        if (!code) {
            setErrorMessage("Invalid or missing reset code. Please request a new password reset link.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await resetPassword(values.password, code);

            if (response.status === "success") {
                toast.success(response.message);
                form.reset();
                // Redirect to sign in page after successful reset
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            } else {
                setErrorMessage(response.message);
                toast.error(response.message);
            }
        } catch (error: any) {
            const errorMsg = error?.message || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [form, searchParams, router]);

    if (!isMounted) return null;

    return (
        <Suspense fallback={<Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />}>
            <div
                className="min-h-screen flex items-center justify-center px-6 py-12"
                style={{
                    backgroundColor: COLORS.light.bgSecondary,
                    fontFamily: TYPOGRAPHY.fonts.body
                }}
            >
                <Card className={cn(
                    "max-w-md w-full shadow-xl border-0 backdrop-blur-sm",
                    "transition-all duration-300 hover:shadow-2xl"
                )}
                    style={{ backgroundColor: COLORS.light.bg }}
                >
                    <CardContent className="p-8 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-3 text-center">
                            <h2
                                className={cn(
                                    TYPOGRAPHY.sizes.h3,
                                    TYPOGRAPHY.weights.bold
                                )}
                                style={{
                                    color: COLORS.light.text,
                                    fontFamily: TYPOGRAPHY.fonts.heading
                                }}
                            >
                                Reset Password
                            </h2>
                            <p
                                className={cn(TYPOGRAPHY.sizes.base)}
                                style={{ color: COLORS.light.textSecondary }}
                            >
                                Enter your new password below.
                            </p>
                        </div>

                        {/* Form Section */}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-5">
                                    {/* Error Message Display */}
                                    {errorMessage && (
                                        <div
                                            className="p-3 rounded-md text-sm"
                                            style={{
                                                backgroundColor: `${COLORS.error}10`,
                                                color: COLORS.error,
                                                border: `1px solid ${COLORS.error}30`
                                            }}
                                        >
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Password Field */}
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={cn(
                                                        TYPOGRAPHY.sizes.sm,
                                                        TYPOGRAPHY.weights.medium
                                                    )}
                                                    style={{ color: COLORS.light.text }}
                                                >
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-3 top-3 h-5 w-5"
                                                            style={{ color: COLORS.light.textMuted }}
                                                        />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            className={cn(
                                                                "pl-10 pr-10 h-12 transition-all duration-200",
                                                                "focus:ring-2 focus:ring-opacity-50",
                                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                                            )}
                                                            style={{
                                                                borderColor: COLORS.light.border,
                                                                backgroundColor: COLORS.light.bg,
                                                                color: COLORS.light.text,
                                                            }}
                                                            disabled={isLoading}
                                                            autoComplete="new-password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-3"
                                                            style={{ color: COLORS.light.textMuted }}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className={cn(TYPOGRAPHY.sizes.xs)} style={{ color: COLORS.error }} />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Confirm Password Field */}
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={cn(
                                                        TYPOGRAPHY.sizes.sm,
                                                        TYPOGRAPHY.weights.medium
                                                    )}
                                                    style={{ color: COLORS.light.text }}
                                                >
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-3 top-3 h-5 w-5"
                                                            style={{ color: COLORS.light.textMuted }}
                                                        />
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm new password"
                                                            className={cn(
                                                                "pl-10 pr-10 h-12 transition-all duration-200",
                                                                "focus:ring-2 focus:ring-opacity-50",
                                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                                            )}
                                                            style={{
                                                                borderColor: COLORS.light.border,
                                                                backgroundColor: COLORS.light.bg,
                                                                color: COLORS.light.text,
                                                            }}
                                                            disabled={isLoading}
                                                            autoComplete="new-password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-3"
                                                            style={{ color: COLORS.light.textMuted }}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className={cn(TYPOGRAPHY.sizes.xs)} style={{ color: COLORS.error }} />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="space-y-6">
                                    <Button
                                        type="submit"
                                        className={cn(
                                            "w-full h-12 transition-all duration-200",
                                            TYPOGRAPHY.sizes.base,
                                            TYPOGRAPHY.weights.medium,
                                            "focus:ring-4 focus:ring-opacity-20",
                                            "disabled:opacity-50 disabled:cursor-not-allowed",
                                            "hover:shadow-lg transform hover:-translate-y-0.5"
                                        )}
                                        style={{
                                            backgroundColor: COLORS.primary,
                                            color: '#ffffff',
                                        }}
                                        disabled={isLoading}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = COLORS.primary;
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                                Resetting...
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                    <div className="space-y-4">
                                        <Separator style={{ backgroundColor: COLORS.light.border }} />
                                        <div
                                            className={cn(
                                                "text-center",
                                                TYPOGRAPHY.sizes.sm
                                            )}
                                            style={{ color: COLORS.light.textMuted }}
                                        >
                                            Remember your password?{" "}
                                            <Link
                                                href="/signin"
                                                className={cn(
                                                    TYPOGRAPHY.weights.medium,
                                                    "hover:underline transition-colors duration-200",
                                                    "focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-sm px-1"
                                                )}
                                                style={{
                                                    color: COLORS.primary,
                                                    fontFamily: TYPOGRAPHY.fonts.body
                                                }}
                                                tabIndex={isLoading ? -1 : 0}
                                            >
                                                Sign in here
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Suspense>
    );
};

export default UserResetPassword;