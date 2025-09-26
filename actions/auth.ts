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

export async function signUp(formData: SignUpData): Promise<AuthResponse> {
    const supabase = await createClient();

    // Check if username exists
    const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id") // selecting id is enough
        .eq("username", formData.username.toLowerCase())
        .maybeSingle();

    if (checkError) {
        return { status: "error", message: "Error checking username availability" };
    }

    if (existingUser) {
        return { status: "error", message: "Username already taken" };
    }

    // Sign up with Supabase Auth
    const { data: authData, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
    });

    if (error) {
        return { status: "error", message: error.message };
    }

    if (!authData.user) {
        return { status: "error", message: "Sign-up failed, no user returned" };
    }

    if (authData.user.identities?.length === 0) {
        return { status: "error", message: "User with this email already exists" };
    }

    // Prepare userData for table
    const userData = {
        uid: authData.user.id,
        username: formData.username.toLowerCase(),
        email: formData.email,
        phone_number: formData.phoneNumber,
        profile_image: "",
        role: ["borrower"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert(userData);

    if (insertError) {
        console.error("Insert error:", insertError);
        return { status: "error", message: "Failed to insert user record" };
    }

    revalidatePath("/", "layout");
    return { status: "success", message: "User created", user: userData };
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



export async function signIn(formData: SignInData) {
    const supabase = await createClient();

    try {
        // Sign in with Supabase Auth
        const { error, data } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            console.error('Authentication error:', error);
            return {
                status: error.message,
                user: null
            };
        }

        // Check if user exists in users table using uid (Supabase auth ID)
        const { data: existingUser, } = await supabase
            .from("users")
            .select("*")
            .eq("uid", data.user.id)
            .single();

        // If user doesn't exist, create a new user record
        if (!existingUser) {
            const username = data.user.user_metadata?.username ||
                data.user.email?.split('@')[0] ||
                `user_${Math.random().toString(36).substring(2, 10)}`;

            const userData = {
                uid: data.user.id,
                id: crypto.randomUUID(),
                username: username,
                email: data.user.email!,
                phone_number: data.user.user_metadata?.phone_number || data.user.phone || '',
                full_name: data.user.user_metadata?.full_name || '',
                first_name: data.user.user_metadata?.first_name || '',
                last_name: data.user.user_metadata?.last_name || '',
                role: ['borrower'],
                current_role: 'borrower',
                status: 'active',
                email_verified: data.user.email_confirmed_at ? true : false,
                phone_verified: data.user.phone_confirmed_at ? true : false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Creating new user with data:', userData);

            const { error: insertError } = await supabase
                .from("users")
                .insert(userData);

            if (insertError) {
                console.error('Error creating user:', insertError);
                return {
                    status: insertError.message || 'Failed to create user profile',
                    user: null
                };
            }

            console.log('Successfully created user profile');
        }

        // Update user metadata with role if not set
        if (!data.user.user_metadata?.role) {
            const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                    role: 'borrower',
                    ...(data.user.user_metadata || {})
                }
            });

            if (metadataError) {
                console.error('Error updating user metadata:', metadataError);
            }
        }

        // Get the updated user data
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('uid', data.user.id)
            .single();

        revalidatePath("/", "layout");
        return {
            status: "success",
            user: userData || data.user
        };

    } catch (error) {
        console.error('Unexpected error during sign in:', error);
        return {
            status: 'An unexpected error occurred',
            user: null
        };
    }
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
                    prompt: 'select_account login',
                },
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

