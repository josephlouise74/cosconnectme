// Updated LenderFormData to match your actual type
// types/lender-form-data-type.ts

export interface PersonalInfo {
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
}

export type ValidIdType =
    | 'NATIONAL_ID'
    | 'DRIVERS_LICENSE'
    | 'PASSPORT'
    | 'SSS_ID'
    | 'PHILHEALTH_ID'
    | 'VOTERS_ID'
    | 'TIN_ID'
    | 'POSTAL_ID'
    | 'UMID'
    | 'PRC_ID';

export interface Identification {
    has_valid_id: boolean;
    valid_id_type: ValidIdType;
    valid_id_number: string;
    valid_id_file: string;
    selfie_with_id: string;
}



export interface LenderFormDataType {
    personal_info: PersonalInfo;
    identification: Identification;
    business_info: BusinessInfo;
    terms_and_conditions: 'Accepted';
}



// Types based on your backend controller and actual data structure
export interface LenderV2ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    errors?: Array<{ field: string; message: string }>
}



export interface City {
    id: string;
    name: string;
    region: string;
    country: string;
    province: string;
}

export interface BusinessInfo {
    business_type: string;
    business_name: string;
    business_description: string;
    business_phone_number: string;
    business_email: string;
    business_telephone: string;
    business_address: string;
    street: string;
    barangay: string;
    city: City;
    province: string;
    region: string;
    zip_code: string;
    country: string;
    upload_dti_certificate: string;
    upload_business_permit: string;
    upload_storefront_photo: string;
}

export interface LenderData {
    user_id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    status: 'verified' | 'unverified';
    email_verified: boolean;
    phone_verified: boolean;
    profile_image: string;
    bio: string | null;
    created_at: string;
    updatedAt: string;
    business_info: BusinessInfo;
}

export interface LenderByIdResponse {
    success: boolean;
    data: LenderData;
}


export const primaryIdTypes = [
    "NATIONAL_ID",
    "PASSPORT",
    "DRIVERS_LICENSE",
    "UMID",
    "SSS_ID",
    "GSIS_ID",
    "PRC_ID",
    "POSTAL_ID",
    "PHILHEALTH_ID",
    "VOTERS_ID",
    "SENIOR_CITIZEN_ID",
    "PWD_ID",
    "INTEGRATED_BAR_ID",
    "OFW_ID",
] as const;

export const secondaryIdTypes = [
    "BARANGAY_ID",
    "POLICE_CLEARANCE",
    "NBI_CLEARANCE",
    "BIRTH_CERTIFICATE",
    "TIN_ID",
    "PAGIBIG_ID",
    "COMPANY_ID",
    "SCHOOL_ID",
    "POSTAL_ID",
    "BRGY_CLEARANCE",
    "CEDULA",
    "INSURANCE_ID",
    "BIR_ID",
    "OWWA_ID",
    "MARINA_ID",
] as const;
