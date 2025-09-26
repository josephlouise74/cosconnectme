export interface CostumePricing {
    rental?: {
        price: string
        security_deposit: string
        extended_days_price: string
    }
    sale?: {
        price: string
        discount_percentage: number
    }
}

export interface CostumeImage {
    url: string
    alt_text?: string
    order?: number
}

export interface CostumeImages {
    main: {
        front: string
        back: string
    }
    additional: CostumeImage[]
}

export interface LenderContact {
    email: string
    phone: string
}

export interface LenderImages {
    profile: string | null
    background: string | null
}

export interface LenderAddress {
    street: string
    barangay: string
    city: {
        id: string
        name: string
    }
    province: string
    region: string
    zip_code: string
    country: string
}

export interface LenderInfo {
    uid: string
    name: string
    email: string
    profile_image: string | null
    business_name: string
    business_description: string
    business_type: "INDIVIDUAL" | "STORE" | "REGISTERED"
    business_email: string
    business_phone: string
    business_profile_image: string | null
    business_background_image: string | null
    contact: LenderContact
    images: LenderImages
    address: LenderAddress
}

export interface CostumeByName {
    id: string
    name: string
    brand: string
    category: string
    description: string
    gender: string
    sizes: string
    tags: string[]
    listing_type: "rent" | "sell"
    rental_price: string
    sale_price: string
    security_deposit: string
    discount_percentage: number
    extended_days_price: string
    main_images: {
        front: string
        back: string
    }
    additional_images: any[]
    view_count: number
    favorite_count: number
    created_at: string
    updated_at: string
    status: string
    is_available: boolean

    // Lender fields (flattened in response)
    user_email: string
    user_name: string
    user_profile_image: string
    business_name: string
    business_description: string
    business_type: "INDIVIDUAL" | "STORE" | "REGISTERED"
    business_email: string
    business_phone: string
    business_profile_image: string | null
    business_background_image: string | null
    address_street: string
    address_barangay: string
    address_city: {
        id: string
        name: string
    }
    address_province: string
    address_region: string
    address_zip_code: string
    address_country: string

    // Additional fields
    add_ons: any[]
    booked_dates: string[]

    // Computed properties for backward compatibility
    pricing: CostumePricing
    images: CostumeImages
    lender: LenderInfo
}

export interface GetCostumeByNameResponse {
    success: boolean
    message: string
    data: CostumeByName
}