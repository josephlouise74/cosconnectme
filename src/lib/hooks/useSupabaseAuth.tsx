"use client"


import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserRoles } from '../api/authApi';

type UserRole = "lender" | "borrower" | null;

interface AuthState {
    isAuthenticated: boolean;
    currentRole: UserRole;
    user: any;
    isLoading: boolean;
}

// Define the userRolesDataType interface
export interface userRolesDataType {
    user_id: string;
    username: string;
    email: string;
    roles: ("borrower" | "lender")[];
    current_role: "borrower" | "lender";
    status: "active" | "inactive" | "suspended" | "pending_verification" | "verified" | "rejected";
    can_switch_roles?: boolean;
    personal_info: {
        full_name: string;
        first_name: string;
        middle_name?: string | null;
        last_name: string;
        username: string;
        phone_number?: string;
        profile_image?: string;
        profile_background?: string;
        bio?: string;
    };
    address_information: {
        street: string;
        zip_code: string;
        barangay: string;
        province: string;
        region: string;
        country: string;
        city: {
            id: string;
            name: string;
        };
    };
    identification_info: {
        has_valid_id: boolean;
        valid_id_type: 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'SSS_ID' | 'PHILHEALTH_ID' | 'VOTERS_ID' | 'TIN_ID' | 'POSTAL_ID' | 'UMID' | 'PRC_ID';
        valid_id_number: string;
        valid_id_file: File | string;
        selfie_with_id: File | string;
    };
    business_info: {
        business_name?: string;
        business_description?: string;
        business_type?: 'INDIVIDUAL' | 'STORE';
        business_phone_number?: string;
        business_telephone?: string;
        business_address?: string;
        street?: string;
        barangay?: string;
        city?: {
            id: string;
            name: string;
            region?: string;
            country?: string;
            province?: string;
        };
        province?: string;
        region?: string;
        zip_code?: string;
        country?: string;
        business_permit_file?: string;
        upload_dti_certificate?: string;
        upload_storefront_photo?: string;
        terms_and_conditions?: 'Accepted';
    };
    terms_and_conditions?: 'Accepted';
}

export const useSupabaseAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        currentRole: null,
        user: null,
        isLoading: true,
    });

    const router = useRouter();

    // Get user roles using the API
    const { data: userRolesData, isLoading: rolesLoading, error: rolesError } = useGetUserRoles(
        authState.user?.id || '',
        authState.isAuthenticated && !!authState.user?.id
    );

    useEffect(() => {
        if (rolesError) {
            router.push('/signin');
        }
    }, [rolesError, router]);

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    setAuthState({
                        isAuthenticated: false,
                        currentRole: null,
                        user: null,
                        isLoading: false,
                    });
                    return;
                }

                if (session?.user) {
                    setAuthState({
                        isAuthenticated: true,
                        currentRole: null, // Will be set by the API call
                        user: session.user,
                        isLoading: false,
                    });
                } else {
                    setAuthState({
                        isAuthenticated: false,
                        currentRole: null,
                        user: null,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Error in getInitialSession:', error);
                setAuthState({
                    isAuthenticated: false,
                    currentRole: null,
                    user: null,
                    isLoading: false,
                });
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_, session) => {

                if (session?.user) {
                    setAuthState({
                        isAuthenticated: true,
                        currentRole: null, // Will be set by the API call
                        user: session.user,
                        isLoading: false,
                    });
                } else {
                    setAuthState({
                        isAuthenticated: false,
                        currentRole: null,
                        user: null,
                        isLoading: false,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Update current role when user roles data is available
    useEffect(() => {
        if (userRolesData && userRolesData.current_role) {
            setAuthState(prev => ({
                ...prev,
                currentRole: userRolesData.current_role as UserRole,
            }));
        }
    }, [userRolesData]);

    // Determine if we're still loading
    const isLoading = authState.isLoading || (authState.isAuthenticated && rolesLoading);

    return {
        ...authState,
        isLoading,
        userRolesData: userRolesData as userRolesDataType | undefined,
        rolesError,
    };
}; 