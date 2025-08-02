// ===============================
// UNIFIED TYPES
// ===============================

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface CostumeAddOn {
    id: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

export interface CostumeImage {
    url: string;
    order: number;
}

export interface RentOffer {
    type: string;
    price: string;
}

export interface Sale {
    price: string;
    discount: number;
}

export type ListingType = 'rent' | 'sale' | 'both';
export type Gender = 'male' | 'female' | 'unisex';
export type CostumeStatus = 'active' | 'inactive' | 'pending';

export interface CostumeItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    gender: Gender;
    tags: string[];
    extended_days: string;
    security_deposit: string;
    listing_type: ListingType;
    main_images: {
        front: string;
        back: string;
    };
    additional_images: CostumeImage[];
    lender_user_id: string;
    lender_user_email: string;
    lender_user_username: string;
    add_ons: CostumeAddOn[];
    selected_costume_type: string;
    sizes: string;
    status: CostumeStatus;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    rent?: {
        main_rent_offer: RentOffer;
        alternative_rent_offers: RentOffer[];
    };
    sale?: Sale;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T> {
    pagination: Pagination;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Array<{
        code: string;
        expected?: string;
        received?: string;
        path: (string | number)[];
        message: string;
    }>;
}
