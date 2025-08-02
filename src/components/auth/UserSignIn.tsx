"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signInWithGoogle } from "actions/auth";
import { Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SigninSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninFormData = z.infer<typeof SigninSchema>;

const UserSignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const router = useRouter();

    const form = useForm<SigninFormData>({
        resolver: zodResolver(SigninSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = useCallback(async (values: SigninFormData) => {
        setIsLoading(true);
        setFieldErrors({}); // Clear previous errors

        try {
            const result = await signIn({
                email: values.email,
                password: values.password
            });

            if (result.status === "success") {
                toast.success("Signed in successfully!");
                router.push("/"); // Redirect to dashboard
            } else {
                // Handle specific error messages
                if (result.status?.includes("Invalid login credentials")) {
                    toast.error("Invalid email or password. Please try again.");
                    setFieldErrors({
                        email: "Invalid email or password",
                        password: "Invalid email or password"
                    });
                    form.setError("email", {
                        type: "manual",
                        message: "Invalid email or password"
                    });
                    form.setError("password", {
                        type: "manual",
                        message: "Invalid email or password"
                    });
                } else if (result.status?.includes("Email not confirmed")) {
                    toast.error("Please verify your email address before signing in.");
                    setFieldErrors({
                        email: "Please verify your email first"
                    });
                    form.setError("email", {
                        type: "manual",
                        message: "Please verify your email first"
                    });
                } else if (result.status?.includes("User not found")) {
                    toast.error("No account found with this email address.");
                    setFieldErrors({
                        email: "No account found with this email"
                    });
                    form.setError("email", {
                        type: "manual",
                        message: "No account found with this email"
                    });
                } else if (result.status?.includes("Too many requests")) {
                    toast.error("Too many sign-in attempts. Please try again later.");
                } else {
                    toast.error(result.status || "An error occurred during sign-in. Please try again.");
                }
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [form, router]);

    const handleGoogleSignIn = useCallback(async () => {
        setIsGoogleLoading(true);
        try {
            // Get the OAuth URL from Supabase
            const response = await signInWithGoogle();
            console.log("Google Sign-in Response:", response);

            if (response.success && response.url) {
                console.log("Redirecting to Google OAuth URL:", response.url);
                // Redirect to Google OAuth
                window.location.href = response.url;
            } else {
                throw new Error("No OAuth URL received");
            }
        } catch (error: any) {
            console.error("Google sign-in error:", error);

            // Handle specific error types
            if (error.message?.includes("redirect_uri_mismatch")) {
                toast.error("OAuth configuration error. Please contact support.");
            } else if (error.message?.includes("Could not determine origin URL")) {
                toast.error("Unable to determine app URL. Please refresh and try again.");
            } else {
                toast.error("Failed to sign in with Google. Please try again.");
            }

            setIsGoogleLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Card className="w-full shadow-lg border-0">
                        <CardContent className="p-8 space-y-8">
                            {/* Header Section */}
                            <div className="space-y-3 text-center">
                                <h2 className="text-2xl font-bold">
                                    Welcome Back!
                                </h2>
                                <p className="text-muted-foreground">
                                    Sign in to start renting costumes
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
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                            <Input
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                className={cn(
                                                                    "pl-10 h-12",
                                                                    fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                                                                )}
                                                                disabled={isLoading || isGoogleLoading}
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
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Password Field */}
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                            <Input
                                                                type="password"
                                                                placeholder="Enter your password"
                                                                className={cn(
                                                                    "pl-10 h-12",
                                                                    fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                                                                )}
                                                                disabled={isLoading || isGoogleLoading}
                                                                autoComplete="current-password"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    if (fieldErrors.password) {
                                                                        const newErrors = { ...fieldErrors };
                                                                        delete newErrors.password;
                                                                        setFieldErrors(newErrors);
                                                                        form.clearErrors("password");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Forgot Password Link */}
                                        <div className="flex justify-end">
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1"
                                                tabIndex={isLoading || isGoogleLoading ? -1 : 0}
                                            >
                                                Forgot Password?
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="space-y-6">
                                        <Button
                                            type="submit"
                                            className="w-full h-12"
                                            disabled={isLoading || isGoogleLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                                    Signing in...
                                                </div>
                                            ) : (
                                                "Sign in"
                                            )}
                                        </Button>


                                        {/* Divider */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">
                                                    Or continue with email
                                                </span>
                                            </div>
                                        </div>


                                        {/* Google Sign In Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-12 cursor-pointer  transition-colors duration-200"
                                            onClick={handleGoogleSignIn}
                                            disabled={isGoogleLoading || isLoading}
                                        >
                                            {isGoogleLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                                                    <span>Signing in with Google...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                    <span>Continue with Google</span>
                                                </div>
                                            )}
                                        </Button>


                                        {/* Separator and Sign Up Link */}
                                        <div className="space-y-4">
                                            <Separator />
                                            <div className="text-center text-sm text-muted-foreground">
                                                Don't have an account?{" "}
                                                <Link
                                                    href="signup"
                                                    className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1"
                                                    tabIndex={isLoading || isGoogleLoading ? -1 : 0}
                                                >
                                                    Create an account
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

export default UserSignIn;