
// Types based on your backend controller and actual data structure
export interface SwitchRoleResponse<T = any> {
    success: boolean
    message: string
    data?: T
    errors?: Array<{ field: string; message: string }>
}

export interface UserRolesData {
    user_id: string
    username: string
    email: string
    roles: string[]
    current_role: string
    status: string
    can_switch_roles: boolean
    personal_info: {
        full_name: string
        first_name: string
        middle_name?: string | null
        last_name: string
        profile_image?: string | null;
    }
    address_information: {
        street: string
        zip_code: string
        barangay: string
        province: string
        region: string
        country: string
        city: {
            id: string
            name: string
            region: string
            country: string
            province: string
        }
    }
    identification_info: {
        has_valid_id: boolean
        valid_id_type?: 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'SSS_ID' | 'PHILHEALTH_ID' | 'VOTERS_ID' | 'TIN_ID' | 'POSTAL_ID' | 'UMID' | 'PRC_ID'
        valid_id_number?: string
        valid_id_file?: string
        selfie_with_id?: string
    }
    business_info?: {
        city: {
            id: string
            name: string
            region: string
            country: string
            province: string
        }
        region: string
        street: string
        country: string
        barangay: string
        province: string
        zip_code: string
        business_name: string
        business_type: 'INDIVIDUAL' | 'REGISTERED'
        business_description: string
        business_permit_file: string
        terms_and_conditions: 'Accepted'
        business_phone_number: string
    } | null
}

export interface SwitchRoleData {
    current_role: string
    available_roles: string[]
    status: string
}