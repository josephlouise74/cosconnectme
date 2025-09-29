// src/components/CostumeListSection.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { Suspense, useCallback, useMemo, useReducer } from "react";

import { useFetchAllCategories } from "@/lib/api/categoryApi";
import { Costume, useGetMyCostumes } from "@/lib/api/costumeApi";
import CostumePaginationSection from "./UiProductsSections/CostumePaginationSection";
import ProductHeader from "./UiProductsSections/ProducHeaderSection";
import ProductDetailDialog from "./UiProductsSections/ProductDetailsDialogSection";
import CostumeTableSection from "./UiProductsSections/ProductTableSection";

// Sorting config
interface SortConfig {
    key: keyof Costume | "rental_price" | "sale_price" | null;
    direction: "asc" | "desc" | null;
}

// Component state
interface CostumeListState {
    searchQuery: string;
    sortConfig: SortConfig;
    categoryFilter: string | null;
    statusFilter: string | null;
    selectedCostume: Costume | null;
    viewDialog: boolean;
    deleteDialog: boolean;
    costumeToDelete: Costume | null;
    currentPage: number;
    itemsPerPage: number;
}

// Actions
type CostumeListAction =
    | { type: "SET_SEARCH_QUERY"; payload: string }
    | { type: "SET_SORT_CONFIG"; payload: SortConfig }
    | { type: "SET_CATEGORY_FILTER"; payload: string | null }
    | { type: "SET_STATUS_FILTER"; payload: string | null }
    | { type: "SET_SELECTED_COSTUME"; payload: Costume | null }
    | { type: "SET_VIEW_DIALOG"; payload: boolean }
    | { type: "SET_DELETE_DIALOG"; payload: boolean }
    | { type: "SET_COSTUME_TO_DELETE"; payload: Costume | null }
    | { type: "SET_CURRENT_PAGE"; payload: number }
    | { type: "SET_ITEMS_PER_PAGE"; payload: number }
    | { type: "RESET_COSTUME_TO_DELETE" }
    | { type: "RESET_ALL_FILTERS" };

// Initial state
const initialState: CostumeListState = {
    searchQuery: "",
    sortConfig: { key: null, direction: null },
    categoryFilter: null,
    statusFilter: null,
    selectedCostume: null,
    viewDialog: false,
    deleteDialog: false,
    costumeToDelete: null,
    currentPage: 1,
    itemsPerPage: 10,
};

// Reducer
function costumeListReducer(
    state: CostumeListState,
    action: CostumeListAction
): CostumeListState {
    switch (action.type) {
        case "SET_SEARCH_QUERY":
            return { ...state, searchQuery: action.payload, currentPage: 1 };
        case "SET_SORT_CONFIG":
            return { ...state, sortConfig: action.payload };
        case "SET_CATEGORY_FILTER":
            return { ...state, categoryFilter: action.payload, currentPage: 1 };
        case "SET_STATUS_FILTER":
            return { ...state, statusFilter: action.payload, currentPage: 1 };
        case "SET_SELECTED_COSTUME":
            return { ...state, selectedCostume: action.payload };
        case "SET_VIEW_DIALOG":
            return { ...state, viewDialog: action.payload };
        case "SET_DELETE_DIALOG":
            return { ...state, deleteDialog: action.payload };
        case "SET_COSTUME_TO_DELETE":
            return { ...state, costumeToDelete: action.payload };
        case "SET_CURRENT_PAGE":
            return { ...state, currentPage: action.payload };
        case "SET_ITEMS_PER_PAGE":
            return { ...state, itemsPerPage: action.payload, currentPage: 1 };
        case "RESET_COSTUME_TO_DELETE":
            return { ...state, costumeToDelete: null, deleteDialog: false };
        case "RESET_ALL_FILTERS":
            return {
                ...state,
                searchQuery: "",
                categoryFilter: null,
                statusFilter: null,
                currentPage: 1,
            };
        default:
            return state;
    }
}

// Filtering
const filterProducts = (
    costumes: Costume[],
    searchQuery: string,
    categoryFilter: string | null,
    statusFilter: string | null
): Costume[] => {
    return costumes.filter((costume) => {
        const matchesSearch =
            !searchQuery ||
            costume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            costume.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            costume.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            costume.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
            !categoryFilter || costume.category === categoryFilter;

        // Updated to match the correct status enum values
        const matchesStatus = !statusFilter || costume.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });
};

// Sorting
const sortProducts = (
    costumes: Costume[],
    sortConfig: SortConfig
): Costume[] => {
    if (!sortConfig.key || !sortConfig.direction) return costumes;

    return [...costumes].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        // Handle special price sorting cases
        if (sortConfig.key === "rental_price") {
            aValue = parseFloat(a.rental_price) || 0;
            bValue = parseFloat(b.rental_price) || 0;
        } else if (sortConfig.key === "sale_price") {
            aValue = parseFloat(a.sale_price) || 0;
            bValue = parseFloat(b.sale_price) || 0;
        } else {
            aValue = a[sortConfig.key as keyof Costume];
            bValue = b[sortConfig.key as keyof Costume];
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });
};

// Updated statuses to match the schema
const getAvailableStatuses = (): Costume["status"][] => [
    "active",
    "inactive",
    "rented",
    "maintenance"
];

const CostumeListSection = () => {

    const [state, dispatch] = useReducer(costumeListReducer, initialState);

    const { userRolesData, user } = useSupabaseAuth();
    const lenderId = userRolesData?.user_id || user?.id || "";

    // Fetch costumes (with pagination)
    const {
        data: costumesResponse,
        isLoading,
        isError,
        error,
    } = useGetMyCostumes({
        lender_id: lenderId,
        page: state.currentPage,
        limit: state.itemsPerPage,
    });

    console.log("costumesResponse", costumesResponse);

    // Fixed: Access data directly from response, not nested in items.docs
    const costumes = costumesResponse?.data ?? [];
    const pagination = costumesResponse?.pagination;

    // Fetch categories
    const { data: categoriesData } = useFetchAllCategories({
        page: 1,
        limit: 100,
    });

    // Sorting handler - updated to include price fields
    const handleSort = useCallback(
        (key: keyof Costume | "rental_price" | "sale_price") => {
            let direction: "asc" | "desc" | null = "asc";

            if (state.sortConfig.key === key) {
                if (state.sortConfig.direction === "asc") {
                    direction = "desc";
                } else if (state.sortConfig.direction === "desc") {
                    direction = null;
                }
            }

            dispatch({
                type: "SET_SORT_CONFIG",
                payload: { key, direction },
            });
        },
        [state.sortConfig]
    );

    // Filter + sort
    const filteredAndSortedCostumes = useMemo(() => {
        let result = filterProducts(
            costumes,
            state.searchQuery,
            state.categoryFilter,
            state.statusFilter
        );
        result = sortProducts(result, state.sortConfig);
        return result;
    }, [
        costumes,
        state.searchQuery,
        state.categoryFilter,
        state.statusFilter,
        state.sortConfig,
    ]);

    // Categories
    const categories = useMemo(() => {
        if (!categoriesData?.data?.categories) return [];
        return categoriesData.data.categories.map((c: any) => c.categoryName);
    }, [categoriesData]);

    const statuses = getAvailableStatuses();

    // Handlers
    const handleViewCostume = useCallback((costume: Costume) => {
        dispatch({ type: "SET_SELECTED_COSTUME", payload: costume });
        dispatch({ type: "SET_VIEW_DIALOG", payload: true });
    }, []);


    const handleDeleteCostume = useCallback((costume: Costume) => {
        dispatch({ type: "SET_COSTUME_TO_DELETE", payload: costume });
        dispatch({ type: "SET_DELETE_DIALOG", payload: true });
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        dispatch({ type: "SET_SEARCH_QUERY", payload: query });
    }, []);

    const handleCategoryFilterChange = useCallback((category: string | null) => {
        dispatch({ type: "SET_CATEGORY_FILTER", payload: category });
    }, []);

    const handleStatusFilterChange = useCallback((status: string | null) => {
        dispatch({ type: "SET_STATUS_FILTER", payload: status });
    }, []);

    const handleResetFilters = useCallback(() => {
        dispatch({ type: "RESET_ALL_FILTERS" });
    }, []);

    const handleViewDialogChange = useCallback((isOpen: boolean) => {
        dispatch({ type: "SET_VIEW_DIALOG", payload: isOpen });
        if (!isOpen) {
            dispatch({ type: "SET_SELECTED_COSTUME", payload: null });
        }
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <Card className="w-full shadow-md">
                <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading costumes...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (isError) {
        return (
            <Card className="w-full shadow-md">
                <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <p className="text-destructive mb-2">Error loading costumes</p>
                            <p className="text-muted-foreground text-sm">
                                {error instanceof Error ? error.message : "An error occurred"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No lender ID
    if (!lenderId) {
        return (
            <Card className="w-full shadow-md">
                <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Please log in to view your costumes.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-md">
            <CardContent className="p-3 sm:p-6">
                <ProductHeader
                    searchQuery={state.searchQuery}
                    onSearchChange={handleSearchChange}
                    categoryFilter={state.categoryFilter}
                    onCategoryFilterChange={handleCategoryFilterChange}
                    categories={categories}
                    statusFilter={state.statusFilter}
                    onStatusFilterChange={handleStatusFilterChange}
                    statuses={statuses}
                    onResetFilters={handleResetFilters}
                />

                <div className="space-y-4 mt-4 w-full">
                    <div className="w-full">
                        <CostumeTableSection
                            costumes={filteredAndSortedCostumes}
                            sortConfig={state.sortConfig}
                            onSort={handleSort}
                            onViewCostume={handleViewCostume}
                            onDeleteCostume={handleDeleteCostume}
                        />
                    </div>

                    {pagination && pagination.total > 0 && (
                        <CostumePaginationSection
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            itemsPerPage={pagination.limit}
                            totalItems={pagination.total}
                            indexOfFirstItem={(pagination.page - 1) * pagination.limit + 1}
                            indexOfLastItem={Math.min(
                                pagination.page * pagination.limit,
                                pagination.total
                            )}
                            hasNext={pagination.hasNextPage}
                            hasPrev={pagination.hasPreviousPage}
                            onPageChange={(page) =>
                                dispatch({ type: "SET_CURRENT_PAGE", payload: page })
                            }
                            onItemsPerPageChange={(limit) =>
                                dispatch({ type: "SET_ITEMS_PER_PAGE", payload: limit })
                            }
                        />
                    )}

                    {/* Empty state */}
                    {costumes.length === 0 && !isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-muted-foreground mb-2">No costumes found</p>
                                <p className="text-sm text-muted-foreground">
                                    {state.searchQuery || state.categoryFilter || state.statusFilter
                                        ? "Try adjusting your search or filters"
                                        : "Create your first costume listing to get started"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <Suspense
                fallback={<div className="p-4 text-center">Loading details...</div>}
            >
                <ProductDetailDialog
                    product={state.selectedCostume}
                    open={state.viewDialog}
                    onOpenChange={handleViewDialogChange}
                />
            </Suspense>
        </Card>
    );
};

export default CostumeListSection;