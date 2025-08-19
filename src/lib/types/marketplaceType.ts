// src/types/marketplace.ts

export interface MarketplaceCostume {
    id: string
    name: string
    brand: string
    category: string
    gender: string
    sizes: string
    listing_type: "rent" | "sell" // extendable if needed
    pricing: {
        rental?: {
            price: string
            security_deposit: string
        }
        sale?: {
            price: string
        }
    }
    main_images: {
        front: string
        back: string
    }
    view_count: number
    favorite_count: number
    created_at: string
    tags: string[]
}

export interface Pagination {
    page: number
    limit: number
    total_count: number
    total_pages: number
    has_next_page: boolean
    has_previous_page: boolean
}

export interface GetMarketplaceCostumesResponse {
    success: boolean
    message: string
    data: {
        costumes: MarketplaceCostume[]
        pagination: Pagination
    }
}
