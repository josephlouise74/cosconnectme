"use server"

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers';
import { redirect } from 'next/navigation'

interface SignUpData {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "borrower";
}

interface SignInData {
    email: string;
    password: string;
}

interface AuthResponse {
    status: "success" | "error";
    message: string;
    user?: any;
}

export async function getUserSession() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Return user without modifying it, role is in user_metadata
    return {
        status: "success",
        user
    };
}

export async function signUp(formData: SignUpData) {
    const supabase = await createClient()

    // Check if username already exists in users table
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username.toLowerCase())
        .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking username:', checkError);
        return {
            status: "Error checking username availability",
            user: null
        }
    }

    if (existingUser) {
        return {
            status: "Username already taken",
            user: null
        }
    }

    // Proceed with sign up if username is available
    const { error, data: authData } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                role: formData.role,
                username: formData.username.toLowerCase(),
                phone_number: formData.phoneNumber,
                created_at: new Date().toISOString()
            }
        }
    })

    if (error) {
        return {
            status: error?.message,
            user: null
        }
    } else if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        return {
            status: "User with this email already exists",
            user: null
        }
    }

    revalidatePath("/", "layout")
    return { status: "success", user: authData.user }
}

export async function signIn(formData: SignInData) {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
    });

    if (error) {
        return {
            status: error?.message,
            user: null
        };
    }

    // Check if user exists in users table using uid (Supabase auth ID)
    const { data: existingUser } = await supabase
        .from("users")
        .select("uid, username, email, phone_number, role")
        .eq("uid", data.user.id) // Use uid instead of email for lookup
        .single();

    // Only create user record if it doesn't exist
    if (!existingUser) {
        const userData = {
            uid: data.user.id, // Use uid as primary key (Supabase auth ID)
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0], // Fallback to email prefix if no username
            email: data.user.email!,
            phone_number: data.user.user_metadata?.phone_number || data.user.phone || '',
            role: ['borrower'], // Role should be an array of strings
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Attempting to insert user data:', userData);

        const { error: insertError } = await supabase
            .from("users")
            .insert(userData);

        if (insertError) {
            console.error('Error inserting user:', insertError);
            console.error('Error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            return {
                status: insertError.message,
                user: null
            };
        }

        console.log('Successfully inserted user into database');

        // Store role in user metadata after successful user creation
        const { error: metadataError } = await supabase.auth.updateUser({
            data: { role: 'borrower' }
        });

        if (metadataError) {
            console.error('Error updating user metadata:', metadataError);
            // Don't fail the entire flow, just log the error
        } else {
            console.log('Successfully stored role "borrower" in user metadata');
        }
    }

    revalidatePath("/", "layout");
    return {
        status: "success",
        user: data.user
    };
}

export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error:', error);
        redirect("/error");
    }
    revalidatePath("/", "layout");
    redirect("/signin");
}

export async function resendEmailConfirmation(email: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            return {
                status: 'error',
                message: error.message
            };
        }

        return {
            status: 'success',
            message: 'Confirmation email has been resent successfully'
        };
    } catch (error: any) {
        return {
            status: 'error',
            message: error.message || 'Failed to resend confirmation email'
        };
    }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
    try {
        const supabase = await createClient();
        const origin = (await headers()).get("origin");

        if (!origin) {
            return {
                status: "error",
                message: "Could not determine origin URL"
            };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/reset-password`
        });

        if (error) {
            return {
                status: "error",
                message: error.message
            };
        }

        return {
            status: "success",
            message: "Password reset instructions have been sent to your email"
        };
    } catch (error: any) {
        return {
            status: "error",
            message: error?.message || "An unexpected error occurred"
        };
    }
}

export async function resetPassword(newPassword: string, code: string): Promise<AuthResponse> {
    try {
        const supabase = await createClient();

        // First verify the code
        const { error: codeError, data } = await supabase.auth.exchangeCodeForSession(code);

        if (codeError) {
            return {
                status: "error",
                message: "Invalid or expired reset code"
            };
        }

        // Then update the password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return {
                status: "error",
                message: updateError.message
            };
        }

        return {
            status: "success",
            message: "Password has been reset successfully",
            user: data?.user
        };
    } catch (error: any) {
        return {
            status: "error",
            message: error?.message || "An unexpected error occurred"
        };
    }
}

export async function signInWithGoogle() {
    try {
        const origin = (await headers()).get("origin");

        // Enhanced origin validation
        if (!origin) {
            console.error("No origin header found");
            throw new Error("Could not determine origin URL");
        }

        console.log("Google Sign-in - Origin:", origin);

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                // Add scopes if needed
                scopes: 'openid email profile'
            }
        });

        console.log("OAuth Data:", data);
        console.log("OAuth Error:", error);

        if (error) {
            console.error("Google OAuth error:", error);
            throw new Error(`Google OAuth failed: ${error.message}`);
        }

        if (!data?.url) {
            console.error("No OAuth URL received from Supabase");
            throw new Error("No OAuth URL received from Supabase");
        }

        console.log("OAuth URL generated successfully:", data.url);
        return {
            success: true,
            url: data.url
        };

    } catch (error) {
        console.error("Error in signInWithGoogle:", error);
        throw error;
    }
}

