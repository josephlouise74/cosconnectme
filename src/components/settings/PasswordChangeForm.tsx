"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, type PasswordChangeFormData } from '@/lib/zodSchema/passwordSchema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PasswordChangeForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: PasswordChangeFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // TODO: Replace with actual API call
            console.log('Changing password with:', data);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            // On success
            setSuccess(true);
            form.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-lg font-medium">Change Password</h2>
                <p className="text-sm text-muted-foreground">
                    Update your account password. Make sure to use a strong password.
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Your password has been updated successfully.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            className="pr-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            className="pr-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <FormMessage />
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            className="pr-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className={cn("w-full sm:w-auto", isLoading && 'opacity-70')}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
