"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, COLORS, TYPOGRAPHY } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "actions/auth";
import { Loader2, Lock, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import TermsAndConditions from "../layout/UiSections/TermsAndConditions";
import PrivacyPolicy from "../layout/UiSections/PrivacyPolicy";
const usernameRegex = /^[a-z0-9_]{3,20}$/; // Only allow lowercase alphanumeric and underscore, 3-20 chars

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const signUpSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(usernameRegex, "Username can only contain lowercase letters, numbers, and underscores (3-20 chars). No spaces or special characters.")
        .transform(val => val.toLowerCase()), // Ensure lowercase
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string()
        .min(9, "Phone number must be at least 9 digits after +63.")
        .max(10, "Phone number must be at most 10 digits after +63.")
        .regex(/^\d{9,10}$/, "Phone number must be 9-10 digits (after +63)."),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(passwordRegex, "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."),
    agreeToTerms: z.boolean()
        .refine((val) => val === true, {
            message: "You must agree to the terms and conditions"
        })
});

type UserSignUpData = z.infer<typeof signUpSchema>;

const UserSignUp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        username?: string;
        email?: string;
    }>({});

    const router = useRouter()
    const form = useForm<UserSignUpData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            phoneNumber: "",
            password: "",
            agreeToTerms: false
        },
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmit = useCallback(async (values: UserSignUpData) => {
        setIsLoading(true);
        setFieldErrors({}); // Clear previous errors

        try {
            const formData = {
                ...values,
                username: values.username.toLowerCase(),
                role: "borrower" as const
            };
            const result = await signUp(formData);
            if (result.status === "success") {
                toast.success("Account created successfully!");
                form.reset();
                router.push("/signin");
            } else {
                console.log(result);
                // Handle specific error messages
                if (result.status === "error") {
                    console.log(result.status, "Username already taken");
                    setFieldErrors(prev => ({ ...prev, username: "This username is already taken" }));
                    form.setError("username", {
                        type: "manual",
                        message: "This username is already taken"
                    });
                } else if (result.status === "User with this email already exists") {
                    setFieldErrors(prev => ({ ...prev, email: "This email is already registered" }));
                    form.setError("email", {
                        type: "manual",
                        message: "This email is already registered"
                    });
                } else {
                    toast.error(result.status || "An error occurred during sign-up");
                }
            }
        } catch (error) {
            console.error("Sign-up error:", error);
            toast.error("An error occurred during sign-up");
        } finally {
            setIsLoading(false);
        }
    }, [form]);

    if (!isMounted) {
        return null;
    }

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
                                    Create Your Account
                                </h2>
                                <p
                                    className={cn(TYPOGRAPHY.sizes.base)}
                                    style={{ color: COLORS.light.textSecondary }}
                                >
                                    Fill in your information to get started
                                </p>
                            </div>

                            {/* Form Section */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-5">
                                        {/* Username Field */}
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={cn(
                                                            TYPOGRAPHY.sizes.sm,
                                                            TYPOGRAPHY.weights.medium
                                                        )}
                                                        style={{ color: COLORS.light.text }}
                                                    >
                                                        Username
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User
                                                                className="absolute left-3 top-3 h-5 w-5"
                                                                style={{ color: COLORS.light.textMuted }}
                                                            />
                                                            <Input
                                                                placeholder="Enter your username"
                                                                className={cn(
                                                                    "pl-10 h-12 transition-all duration-200",
                                                                    "focus:ring-2 focus:ring-opacity-50",
                                                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                                                    fieldErrors.username && "border-rose-500 focus:ring-rose-500/20"
                                                                )}
                                                                style={{
                                                                    borderColor: fieldErrors.username ? COLORS.error : COLORS.light.border,
                                                                    backgroundColor: COLORS.light.bg,
                                                                    color: COLORS.light.text,
                                                                }}
                                                                disabled={isLoading}
                                                                autoComplete="username"
                                                                {...field}
                                                                value={field.value.toLowerCase()}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    field.onChange(value);
                                                                    if (fieldErrors.username) {
                                                                        const newErrors = { ...fieldErrors };
                                                                        delete newErrors.username;
                                                                        setFieldErrors(newErrors);
                                                                        form.clearErrors("username");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage
                                                        className={cn(
                                                            TYPOGRAPHY.sizes.xs,
                                                            "text-rose-500"
                                                        )}
                                                    />
                                                </FormItem>
                                            )}
                                        />

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
                                                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                                                    fieldErrors.email && "border-rose-500 focus:ring-rose-500/20"
                                                                )}
                                                                style={{
                                                                    borderColor: fieldErrors.email ? COLORS.error : COLORS.light.border,
                                                                    backgroundColor: COLORS.light.bg,
                                                                    color: COLORS.light.text,
                                                                }}
                                                                disabled={isLoading}
                                                                autoComplete="email"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    if (fieldErrors.email) {
                                                                        const newErrors = { ...fieldErrors };
                                                                        delete newErrors.email;
                                                                        setFieldErrors(newErrors);
                                                                        form.clearErrors("email");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage
                                                        className={cn(
                                                            TYPOGRAPHY.sizes.xs,
                                                            "text-rose-500"
                                                        )}
                                                    />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Phone Number Field */}
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={cn(
                                                            TYPOGRAPHY.sizes.sm,
                                                            TYPOGRAPHY.weights.medium
                                                        )}
                                                        style={{ color: COLORS.light.text }}
                                                    >
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 select-none">+63</span>
                                                            <Input
                                                                type="tel"
                                                                placeholder="9123456789"
                                                                className={cn(
                                                                    "pl-14 h-12 transition-all duration-200",
                                                                    "focus:ring-2 focus:ring-opacity-50",
                                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                                )}
                                                                style={{
                                                                    borderColor: COLORS.light.border,
                                                                    backgroundColor: COLORS.light.bg,
                                                                    color: COLORS.light.text,
                                                                }}
                                                                disabled={isLoading}
                                                                autoComplete="tel"
                                                                maxLength={10}
                                                                {...field}
                                                                value={field.value.replace(/\D/g, "").slice(0, 10)}
                                                                onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" style={{ color: COLORS.error }} />
                                                </FormItem>
                                            )}
                                        />

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
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock
                                                                className="absolute left-3 top-3 h-5 w-5"
                                                                style={{ color: COLORS.light.textMuted }}
                                                            />
                                                            <Input
                                                                type="password"
                                                                placeholder="Enter your password"
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
                                                                autoComplete="new-password"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" style={{ color: COLORS.error }} />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Terms and Conditions Checkbox */}
                                        <FormField
                                            control={form.control}
                                            name="agreeToTerms"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className={cn(
                                                                "border-slate-200",
                                                                "focus:ring-rose-500/20",
                                                                "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                                                            )}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel
                                                            className={cn(
                                                                TYPOGRAPHY.sizes.sm,
                                                                "text-slate-700 cursor-pointer"
                                                            )}
                                                        >
                                                            I agree to the{" "}
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="link"
                                                                        className="p-0 text-rose-500 hover:underline"
                                                                    >
                                                                        Terms of Service
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                                        <TermsAndConditions />
                                                                </DialogContent>
                                                            </Dialog>
                                                            and{" "}
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="link"
                                                                        className="p-0 text-rose-500 hover:underline"
                                                                    >
                                                                        Privacy Policy
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                                        <PrivacyPolicy />
                                                                </DialogContent>    
                                                            </Dialog>
                                                        </FormLabel>
                                                        <FormMessage
                                                            className={cn(
                                                                TYPOGRAPHY.sizes.xs,
                                                                "text-rose-500"
                                                            )}
                                                        />
                                                    </div>
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
                                                    Creating Account...
                                                </div>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>

                                        {/* Separator and Sign In Link */}
                                        <div className="space-y-4">
                                            <Separator style={{ backgroundColor: COLORS.light.border }} />
                                            <div
                                                className={cn(
                                                    "text-center",
                                                    TYPOGRAPHY.sizes.sm
                                                )}
                                                style={{ color: COLORS.light.textMuted }}
                                            >
                                                Already have an account?{" "}
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
            <div className="hidden lg:block relative bg-muted w-full h-full">

                <div className="relative w-full h-full">
                    <Image
                        src={"https://rlfkmbjptciiluhsbvxx.supabase.co/storage/v1/object/public/images//chris-winchester-nttQtY1-Osg-unsplash.jpg"}
                        alt="Sign In Illustration"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-opacity duration-300"
                        priority
                        quality={90}
                        loading="eager"
                        onLoadingComplete={(img) => {
                            img.classList.remove('opacity-0');
                            img.classList.add('opacity-100');
                        }}
                    />

                </div>

            </div>
        </div>
    );
};

export default UserSignUp;