// types/userResponseTypes.ts

// Base types for common structures
export interface VerificationInfo {
    is_verified: boolean;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
}

export interface LocationInfo {
    street: string;
    barangay: string;
    city: {
        id: string;
        name: string;
    };
    province: string;
    region: string;
    zip_code: string;
    country: string;
}

export interface AddressInfo {
    type: string;
    is_primary: boolean;
}

export interface IdInfo {
    id_type: string | null;
    id_number: string | null;
    has_valid_id: boolean;
}

export interface BaseMetadata {
    role: 'borrower' | 'lender';
    created_at: string;
    updated_at: string;
}

// Business-related types
export interface BusinessInfo {
    id: string;
    user_uid: string;
    business_name: string;
    business_description: string;
    business_type: string;
    business_email: string;
    business_phone_number: string;
    business_telephone: string;
    business_profile_image: string | null;
    business_background_image: string | null;
    upload_business_permit: string;
    business_permit_file: string | null;
    upload_dti_certificate: string;
    upload_storefront_photo: string;
    terms_and_conditions: string;
    is_verified: boolean;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    verification: VerificationInfo;
}

export interface BusinessAddress {
    id: string;
    business_info_id: string;
    business_address: string;
    street: string;
    barangay: string;
    zip_code: string;
    province: string;
    region: string;
    country: string;
    city: {
        id: string;
        name: string;
    };
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    full_address: string;
    location: LocationInfo;
}

export interface BusinessDocument {
    id: string;
    user_uid: string;
    document_type: 'BUSINESS_PERMIT' | 'DTI_CERTIFICATE' | 'STOREFRONT_PHOTO';
    id_type: string | null;
    id_number: string | null;
    file_url: string;
    file_name: string | null;
    has_valid_id: boolean;
    is_verified: boolean;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    verification: VerificationInfo;
}

export interface BusinessStatistics {
    total_addresses: number;
    total_documents: number;
    verified_documents: number;
}

export interface BusinessData {
    info: BusinessInfo;
    addresses: BusinessAddress[];
    documents: BusinessDocument[];
    statistics: BusinessStatistics;
}

export interface BusinessMetadata extends BaseMetadata {
    has_business_info: boolean;
}

// User-related types
export interface PersonalInfo {
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    bio: string | null;
    profile_image: string;
    profile_background: string | null;
}

export interface ContactInfo {
    email: string;
    phone_number: string;
    email_verified: boolean;
    phone_verified: boolean;
}

export interface StatusInfo {
    role: string[];
    current_role: string;
    status: string;
    is_online: boolean;
    last_seen: string | null;
}

export interface UserProfile {
    personal: PersonalInfo;
    contact: ContactInfo;
    status: StatusInfo;
}

export interface User {
    uid: string;
    id: string;
    username: string;
    email: string;
    phone_number: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    bio: string | null;
    profile_image: string;
    profile_background: string | null;
    role: string[];
    current_role: string;
    status: string;
    is_online: boolean;
    rejected_message: string | null;
    suspended_message: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    last_seen: string | null;
    last_account_status_email_sent: string | null;
    reset_token: string | null;
    reset_token_expiry: string | null;
    created_at: string;
    updated_at: string;
    profile: UserProfile;
}

export interface PersonalAddress {
    id: string;
    user_uid: string;
    address: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    region: string;
    zip_code: string;
    country: string;
    address_type: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    full_address: string;
    location: LocationInfo;
    address_info: AddressInfo;
}

export interface PersonalDocument {
    id: string;
    user_uid: string;
    document_type: 'VALID_ID' | 'SELFIE_WITH_ID' | 'SECONDARY_ID_1' | 'SECONDARY_ID_2';
    id_type: string | null;
    id_number: string | null;
    file_url: string;
    file_name: string | null;
    has_valid_id: boolean;
    is_verified: boolean;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    id_info: IdInfo;
    verification: VerificationInfo;
}

export interface PersonalStatistics {
    total_addresses: number;
    primary_addresses: number;
    total_documents: number;
    verified_documents: number;
    valid_id_documents: number;
}

export interface PersonalData {
    addresses: PersonalAddress[];
    documents: PersonalDocument[];
    statistics: PersonalStatistics;
}

// Response types
export interface BusinessResponse {
    success: boolean;
    data: {
        business: BusinessData;
        metadata: BusinessMetadata;
    };
}

export interface UserResponse {
    success: boolean;
    data: {
        user: User;
        personal: PersonalData;
        metadata: BaseMetadata;
    };
}
