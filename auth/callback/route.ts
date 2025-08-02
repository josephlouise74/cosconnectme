import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get('next') ?? '/'
    if (!next.startsWith('/')) {
        // if "next" is not a relative URL, use the default
        next = '/'
    }

    console.log("OAuth Callback - Code:", code ? "Present" : "Missing");
    console.log("OAuth Callback - Next URL:", next);
    console.log("OAuth Callback - Origin:", origin);
    console.log("OAuth Callback - Error from URL:", error);
    console.log("OAuth Callback - Error Description:", errorDescription);

    // Handle OAuth errors from provider
    if (error) {
        const errorParams = new URLSearchParams({
            error_type: 'oauth_provider_error',
            error_code: error,
            error_message: errorDescription || 'OAuth provider returned an error',
            timestamp: new Date().toISOString()
        });
        return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
    }

    // Handle missing code
    if (!code) {
        const errorParams = new URLSearchParams({
            error_type: 'missing_code',
            error_code: 'NO_AUTH_CODE',
            error_message: 'No authorization code received from OAuth provider',
            timestamp: new Date().toISOString()
        });
        return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
    }

    try {
        const supabase = await createClient()
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        console.log("Session Exchange - Error:", sessionError);
        console.log("Session Exchange - User Data:", data?.user ? {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata
        } : "No user data");

        if (sessionError) {
            console.error("OAuth Error - Session exchange failed:", sessionError);
            const errorParams = new URLSearchParams({
                error_type: 'session_exchange_failed',
                error_code: sessionError.status?.toString() || 'UNKNOWN',
                error_message: sessionError.message || 'Failed to exchange authorization code for session',
                timestamp: new Date().toISOString()
            });
            return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
        }

        if (!data?.user) {
            const errorParams = new URLSearchParams({
                error_type: 'no_user_data',
                error_code: 'NO_USER',
                error_message: 'No user data received after successful session exchange',
                timestamp: new Date().toISOString()
            });
            return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
        }

        const user = data.user;

        // Check if user exists in users table using uid (Supabase auth ID)
        const { data: existingUser, error: selectError } = await supabase
            .from("users")
            .select("uid, username, email, phone_number, role")
            .eq("uid", user.id)
            .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no record found

        if (selectError) {
            console.error('Error checking existing user:', selectError);
            const errorParams = new URLSearchParams({
                error_type: 'database_select_error',
                error_code: selectError.code || 'DB_SELECT_ERROR',
                error_message: `Failed to check existing user: ${selectError.message}`,
                timestamp: new Date().toISOString()
            });
            return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
        }

        console.log('Existing user check result:', existingUser);

        // Only create user record if it doesn't exist
        if (!existingUser) {
            console.log('Creating new user record...');

            // Extract data from user_metadata for Google OAuth
            const { user_metadata } = user;
            const email = user_metadata?.email || user.email;
            // Username: use user_metadata.username if available, else use email name (before @)
            let username = user_metadata?.username;
            if (!username || typeof username !== 'string' || username.trim() === '') {
                username = email?.split('@')[0] || `user-${Date.now()}`;
            }
            username = username.toLowerCase();
            const profileImage = user_metadata?.picture || user_metadata?.avatar_url || "";

            const userData = {
                uid: user.id,
                username: username,
                email: email!,
                phone_number: user_metadata?.phone_number || user.phone || '',
                profile_image: profileImage,
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

                const errorParams = new URLSearchParams({
                    error_type: 'database_insert_error',
                    error_code: insertError.code || 'DB_INSERT_ERROR',
                    error_message: `Failed to create user record: ${insertError.message}`,
                    error_details: insertError.details || '',
                    error_hint: insertError.hint || '',
                    timestamp: new Date().toISOString()
                });
                return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
            }

            console.log('Successfully inserted user into database');

            // Store role in user metadata after successful user creation
            const { error: metadataError } = await supabase.auth.updateUser({
                data: { role: 'borrower' }
            });

            if (metadataError) {
                console.error('Error updating user metadata:', metadataError);
                // Don't fail the entire flow, just log the error
                console.log('Warning: Role not stored in user metadata, but user creation was successful');
            } else {
                console.log('Successfully stored role "borrower" in user metadata');
            }
        } else {
            console.log('User already exists in database:', existingUser);
        }

        console.log("OAuth Success - Redirecting to:", next);

        // Handle redirect based on environment
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
            return NextResponse.redirect(`${origin}${next}`)
        }

    } catch (error) {
        console.error("Unexpected error in OAuth callback:", error);

        const errorParams = new URLSearchParams({
            error_type: 'unexpected_error',
            error_code: 'INTERNAL_ERROR',
            error_message: error instanceof Error ? error.message : 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
        return NextResponse.redirect(`${origin}/error?${errorParams.toString()}`);
    }
}