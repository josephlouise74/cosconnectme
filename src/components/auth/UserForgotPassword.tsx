"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, COLORS, TYPOGRAPHY, } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { forgotPassword } from "../../../actions/auth";

const ForgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

const UserForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<ForgotPasswordData>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: "" },
    });

    useEffect(() => { setIsMounted(true); }, []);

    const onSubmit = useCallback(async (values: ForgotPasswordData) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await forgotPassword(values.email);

            if (response.status === "success") {
                toast.success(response.message);
                form.reset();
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
    }, [form]);

    if (!isMounted) return null;

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: COLORS.light.bg }}>
            {/* Left Side - Form */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Card className={cn(
                        "w-full shadow-xl border-0",
                        "transition-all duration-300 hover:shadow-2xl"
                    )} style={{
                        backgroundColor: COLORS.light.bgSecondary,
                        borderColor: COLORS.light.border
                    }}>
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
                                    Forgot Password
                                </h2>
                                <p
                                    className={cn(TYPOGRAPHY.sizes.base)}
                                    style={{ color: COLORS.light.textSecondary }}
                                >
                                    Enter your email address to receive a password reset link.
                                </p>
                            </div>

                            {/* Form Section */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-5">
                                        {/* Email Field */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={cn(
                                                            TYPOGRAPHY.sizes.sm,
                                                            TYPOGRAPHY.weights.medium
                                                        )}
                                                        style={{ color: COLORS.light.text }}
                                                    >
                                                        Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail
                                                                className="absolute left-3 top-3 h-5 w-5"
                                                                style={{ color: COLORS.light.textMuted }}
                                                            />
                                                            <Input
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                className={cn(
                                                                    "pl-10 h-12 transition-all duration-200",
                                                                    "focus:ring-2 focus:ring-opacity-50",
                                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                                )}
                                                                style={{
                                                                    borderColor: COLORS.light.border,
                                                                    backgroundColor: COLORS.light.bg,
                                                                    color: COLORS.light.text,
                                                                }}
                                                                disabled={isLoading}
                                                                autoComplete="email"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className={cn(TYPOGRAPHY.sizes.xs)} style={{ color: COLORS.error }} />
                                                </FormItem>
                                            )}
                                        />

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
                                                    Sending...
                                                </div>
                                            ) : (
                                                "Send Reset Link"
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
                                                Remembered your password?{" "}
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
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative" style={{ backgroundColor: COLORS.light.bgSecondary }}>
                <div className="absolute inset-0" style={{
                    background: `linear-gradient(to bottom right, ${COLORS.light.bgSecondary}99, ${COLORS.light.bgSecondary}95)`
                }} />
                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="max-w-lg text-center space-y-6">
                        <div className="relative w-64 h-64 mx-auto mb-8">
                            <KeyRound className="w-full h-full text-rose-400 opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src={"https://rlfkmbjptciiluhsbvxx.supabase.co/storage/v1/object/public/images//chris-winchester-nttQtY1-Osg-unsplash.jpg"}
                                    alt="Forgot Password Illustration"
                                    width={400}
                                    height={400}
                                    className="w-full h-auto"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className={cn(
                                TYPOGRAPHY.sizes.h4,
                                TYPOGRAPHY.weights.bold
                            )} style={{ color: COLORS.primary }}>
                                Reset Your Password
                            </h3>
                            <p className={cn(
                                TYPOGRAPHY.sizes.base
                            )} style={{ color: COLORS.light.textSecondary }}>
                                Don't worry! We'll help you get back into your account. Just enter your email address and we'll send you a reset link.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserForgotPassword;