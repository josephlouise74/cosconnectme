


export type CreateCostumeResponseType = {
    success: boolean
    message: string
    data: CreatedCostumeType
}

export type CreatedCostumeType = {
    id: string
    name: string
    brand: string
    category: string
    colors: string
    description: string
    discount: number
    gender: 'male' | 'female' | 'unisex'
    tags: string[]
    main_images: {
        front: string
        back: string
    }
    additional_images: {
        url: string
        order: number
    }[]
    lender_user_id: string
    lender_user_email: string
    lender_user_username: string
    add_ons: {
        id: string
        name: string
        image: string
        price: string
        description: string
    }[]
    costume_types: {
        type: string
        price: string
    }[]
    main_offer: {
        type: string
        price: string
    }
    selected_costume_type: string
    sizes: string
    status: string
    is_available: boolean
    created_at: string
    updated_at: string
}

// Create costume payload type based on your backend validation
export type CreateCostumeFormDataType = {
    name: string
    brand: string
    category: string
    colors: string
    description: string
    discount: number | string
    gender: 'male' | 'female' | 'unisex'
    tags: string[]
    mainImages: {
        front: string
        back: string
    }
    additionalImages: {
        url: string
        order: number
    }[]
    lenderUser: {
        uid: string
        email: string
        username: string
    }
    addOns?: {
        id: string
        name: string
        description: string
        price: string
        image?: string
    }[]
    productType: {
        type: string
        price: string
    }[]
    mainOffer: {
        type: string
        price: string
    }
    selectedProductType: string
    sizes: string
}

// Types
export interface CostumeResponse {
    success: boolean;
    data: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    message: string;
}


// src/types/CostumeV2.ts

export interface MainImages {
    front: string;
    back: string;
}

export interface AdditionalImage {
    url: string;
    order: number;
}

export interface AddOn {
    id: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

export interface CostumeType {
    type: string;
    price: string;
}

export interface MainOffer {
    type: string;
    price: string;
}



export interface CostumeType {
    type: string;
    price: string;
}

export interface GetCostumeByIdResponse {
    success: boolean;
    data: any;
    message?: string;
}

// Export types for component usage
export type CostumeListParams = {
    page?: number;
    limit?: number;
    enabled?: boolean;
};

// Product related types
export interface MainImagesType {
    front: File | null;
    back: File | null;
}

export interface AdditionalImageType {
    id: string;
    file: File;
    preview: string;
}

export interface SizeType {
    id: string;
    value: string;
}

export interface ColorType {
    name: string;
    color: string;
}


// Size options
export const SIZE_OPTIONS: SizeType[] = [
    { id: 'size-xs', value: 'XS' },
    { id: 'size-s', value: 'S' },
    { id: 'size-m', value: 'M' },
    { id: 'size-l', value: 'L' },
    { id: 'size-xl', value: 'XL' },
    { id: 'size-2xl', value: '2XL' },
    { id: 'size-3xl', value: '3XL' },
    { id: 'size-custom', value: 'Custom' },
];


