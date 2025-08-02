import { createClient } from '@/utils/supabase/client';

/**
 * Sign up a new user with Supabase
 * @param email User's email
 * @param password User's password
 * @param metadata Additional user metadata (like role, name, etc.)
 * @returns The result of the sign up operation
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata || {},
        },
    });

    return { data, error };
}

/**
 * Sign in a user with Supabase
 * @param email User's email
 * @param password User's password
 * @returns The result of the sign in operation
 */
export async function signIn(email: string, password: string) {
    console.log("email", email)
    console.log("email", password)
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });


    console.log("errror", error)

    return { data, error };
}

/**
 * Sign out the current user
 * @returns The result of the sign out operation
 */
export async function signOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    return { error };
}

/**
 * Get the current user session
 * @returns The current user session or null if not authenticated
 */
export async function getSession() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getSession();

    return { data, error };
}

/**
 * Get the current user
 * @returns The current user or null if not authenticated
 */
export async function getUser() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();

    return { data, error };
} 