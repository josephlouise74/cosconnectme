// Enhanced PersonalInfo interface with all required fields
export interface PersonalInfo {
    first_name: string
    last_name: string
    full_name: string
    username: string
    email: string
    phone_number: string
    middle_name?: string
    bio?: string
    profile_image?: string
    profile_background?: string
    avatar?: string
}

// Updated ValidIdType to match schema enum exactly
export type ValidIdType =
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "PASSPORT"
    | "SSS_ID"
    | "PHILHEALTH_ID"
    | "VOTERS_ID"
    | "TIN_ID"
    | "POSTAL_ID"
    | "UMID"
    | "PRC_ID"

// Enhanced Identification interface
export interface Identification {
    has_valid_id: boolean
    valid_id_type: ValidIdType
    valid_id_number: string
    valid_id_file: string // URL
    selfie_with_id: string // URL
    // Optional secondary IDs
    secondary_id_1?: string
    secondary_id_2?: string
}

// BusinessType matching schema enum
export type BusinessType = "INDIVIDUAL" | "STORE"

// Enhanced BusinessInfo interface with address fields
export interface BusinessInfo {
    business_name: string
    business_description: string
    business_type: BusinessType
    business_email: string
    business_phone_number: string
    business_telephone?: string

    // Media files
    business_profile_image?: string
    business_background_image?: string

    // Address information
    business_address: string
    street: string
    barangay: string
    zip_code: string
    province: string
    region: string
    city: {
        id: string
        name: string
    }

    // Business documents (required for STORE type)
    upload_business_permit?: string
    business_permit_file?: string
    upload_dti_certificate?: string
    upload_storefront_photo?: string
}

// Updated main form data type
export interface LenderFormDataType {
    personal_info: PersonalInfo
    identification: Identification
    business_info: BusinessInfo
    terms_and_conditions: "Accepted"
}

// API Response interface
export interface LenderV2ApiResponse {
    success: boolean
    message: string
    code?: string
    data?: {
        user_id: string
        username: string
        email: string
        roles: string[]
        current_role: string
        status: "active" | "inactive" | "suspended" | "pending_verification" | "verified" | "rejected"
        next_steps: string
    }
    errors?: Array<{
        field: string
        message: string
        code?: string
    }>
}

// Document data interface for internal use
export interface DocumentData {
    id_type?: ValidIdType
    id_number?: string
    file_url: string
    has_valid_id: boolean
}

// User status type from schema
export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification" | "verified" | "rejected"

// Document types from schema
export type DocumentType =
    | "VALID_ID"
    | "SELFIE_WITH_ID"
    | "SECONDARY_ID_1"
    | "SECONDARY_ID_2"
    | "BUSINESS_PERMIT"
    | "DTI_CERTIFICATE"
    | "STOREFRONT_PHOTO"

// Export arrays for validation
export const primaryIdTypes = [
    "NATIONAL_ID",
    "PASSPORT",
    "DRIVERS_LICENSE",
    "UMID",
    "SSS_ID",
    "PRC_ID",
    "POSTAL_ID",
    "PHILHEALTH_ID",
    "VOTERS_ID",
    "TIN_ID",
] as const

export const businessTypes = ["INDIVIDUAL", "STORE"] as const

export const userStatuses = ["active", "inactive", "suspended", "pending_verification", "verified", "rejected"] as const
