// Type for a single category object
export interface Category {
    id: string;
    categoryName: string;
    status: string;
    productListingCount: number;
    totalRentalCount: number;
    adminDetails: {
        adminId: string;
        adminName: string;
        adminEmail: string;
        adminRole: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Response interface for categories API
export interface CategoryResponse {
    success: boolean;
    data: {
        categories: Category[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
        };
    };
}
