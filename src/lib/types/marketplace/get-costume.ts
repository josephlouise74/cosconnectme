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
    business_name: string
    business_description: string
    business_type: "INDIVIDUAL" | "REGISTERED"
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
    pricing: CostumePricing
    images: CostumeImages
    view_count: number
    favorite_count: number
    created_at: string
    updated_at: string
    lender: LenderInfo
}

export interface GetCostumeByNameResponse {
    success: boolean
    data: CostumeByName
}
