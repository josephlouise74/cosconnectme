"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useFetchAllCategories } from "@/lib/apis/categoryApi";


import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';

import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useReducer } from "react";
import ProductHeader from "./UiProductsSections/ProducHeaderSection";
import ProductDetailDialog from "./UiProductsSections/ProductDetailsDialogSection";

import { useGetAllCreatedCostumeByLenderId } from "@/lib/apis/costumesApiV2";
import CostumePaginationSection from "./UiProductsSections/CostumePaginationSection";
import CostumeTableSection from "./UiProductsSections/ProductTableSection";
import { CostumeItemTypeV2 } from "@/types/costumes/costumeTypeV2";

// Updated sort config to match CostumeItemTypeV2
interface SortConfig {
  key: keyof CostumeItemTypeV2 | 'main_rent_offer' | null;
  direction: 'asc' | 'desc' | null;
}

// Define state interface for type safety
interface CostumeListState {
  searchQuery: string;
  sortConfig: SortConfig;
  categoryFilter: string | null;
  statusFilter: string | null;
  genderFilter: string | null;
  selectedCostume: CostumeItemTypeV2 | null;
  viewDialog: boolean;
  deleteDialog: boolean;
  costumeToDelete: CostumeItemTypeV2 | null;
  currentPage: number;
  itemsPerPage: number;
}

// Define action types with proper typing
type CostumeListAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SORT_CONFIG"; payload: SortConfig }
  | { type: "SET_CATEGORY_FILTER"; payload: string | null }
  | { type: "SET_STATUS_FILTER"; payload: string | null }
  | { type: "SET_GENDER_FILTER"; payload: string | null }
  | { type: "SET_SELECTED_COSTUME"; payload: CostumeItemTypeV2 | null }
  | { type: "SET_VIEW_DIALOG"; payload: boolean }
  | { type: "SET_DELETE_DIALOG"; payload: boolean }
  | { type: "SET_COSTUME_TO_DELETE"; payload: CostumeItemTypeV2 | null }
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
  genderFilter: null,
  selectedCostume: null,
  viewDialog: false,
  deleteDialog: false,
  costumeToDelete: null,
  currentPage: 1,
  itemsPerPage: 10
};

// Reducer function with proper TypeScript typing
function costumeListReducer(state: CostumeListState, action: CostumeListAction): CostumeListState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case "SET_SORT_CONFIG":
      return { ...state, sortConfig: action.payload };
    case "SET_CATEGORY_FILTER":
      return { ...state, categoryFilter: action.payload, currentPage: 1 };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case "SET_GENDER_FILTER":
      return { ...state, genderFilter: action.payload, currentPage: 1 };
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
        genderFilter: null,
        currentPage: 1
      };
    default:
      return state;
  }
}

// Updated filter function to work with CostumeItemTypeV2
const filterProducts = (
  costumes: CostumeItemTypeV2[],
  searchQuery: string,
  categoryFilter: string | null,

  statusFilter: string | null,
  genderFilter: string | null
): CostumeItemTypeV2[] => {
  return costumes.filter(costume => {
    const matchesSearch = !searchQuery ||
      costume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      costume.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      costume.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || costume.category === categoryFilter;
    const matchesStatus = !statusFilter || costume.status === statusFilter;
    const matchesGender = !genderFilter || costume.gender === genderFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesGender;
  });
};

// Updated sort function to work with CostumeItemTypeV2
const sortProducts = (costumes: CostumeItemTypeV2[], sortConfig: SortConfig): CostumeItemTypeV2[] => {
  if (!sortConfig.key || !sortConfig.direction) return costumes;

  return [...costumes].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'main_rent_offer') {
      // Defensive: If rent or main_rent_offer is missing, fallback to 0
      aValue = a.rent?.main_rent_offer ? parseFloat(a.rent.main_rent_offer.price) : 0;
      bValue = b.rent?.main_rent_offer ? parseFloat(b.rent.main_rent_offer.price) : 0;
    } else {
      aValue = a[sortConfig.key as keyof CostumeItemTypeV2];
      bValue = b[sortConfig.key as keyof CostumeItemTypeV2];
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Helper functions
const getAvailableStatuses = () => ['active', 'inactive', 'pending', 'draft'];
const getAvailableGenders = () => ['male', 'female', 'unisex'];

const CostumeListSection = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(costumeListReducer, initialState);

  const { userRolesData } = useSupabaseAuth();
  const lenderId = userRolesData?.user_id || "";

  // Fetch costumes with pagination
  const { data: costumes, isLoading, isError, error } = useGetAllCreatedCostumeByLenderId(lenderId);

  // Fetch categories from API
  const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchAllCategories({
    page: 1,
    limit: 100,
  });

  // UI for loading and error states

  // Handle sorting with proper typing
  const handleSort = useCallback((key: keyof CostumeItemTypeV2 | 'main_rent_offer') => {
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
      payload: { key, direction }
    });
  }, [state.sortConfig]);

  // Filter and sort costumes - memoized for performance
  const filteredAndSortedCostumes = useMemo(() => {
    if (!costumes) return [];

    let result = filterProducts(
      costumes,
      state.searchQuery,
      state.categoryFilter,

      state.statusFilter,
      state.genderFilter
    );

    result = sortProducts(result, state.sortConfig);
    return result;
  }, [
    costumes,
    state.searchQuery,
    state.categoryFilter,
    state.statusFilter,
    state.genderFilter,
    state.sortConfig
  ]);

  // Get categories from API response - memoized
  const categories = useMemo(() => {
    if (!categoriesData?.data?.categories) return [];
    return categoriesData.data.categories.map(category => category.categoryName);
  }, [categoriesData]);

  // Get available statuses and genders (these are fixed)
  const statuses = getAvailableStatuses();
  const genders = getAvailableGenders();

  // Calculate display indices (for all items, since no pagination)
  const totalItems = costumes?.length || 0;
  const indexOfFirstItem = 0;
  const indexOfLastItem = totalItems;

  // View costume details - memoized handler
  const handleViewCostume = useCallback((costume: CostumeItemTypeV2) => {
    dispatch({ type: "SET_SELECTED_COSTUME", payload: costume });
    dispatch({ type: "SET_VIEW_DIALOG", payload: true });
  }, []);

  // Edit costume - memoized handler
  const handleEditCostume = useCallback((costumeName: string) => {
    try {
      router.push(`/lender/products/edit?productName=${costumeName}`);
    } catch (error) {
      console.error('Error editing costume:', error);
    }
  }, [router]);

  // Delete costume - memoized handler
  const handleDeleteCostume = useCallback((costume: CostumeItemTypeV2) => {

    dispatch({ type: "SET_COSTUME_TO_DELETE", payload: costume });
    dispatch({ type: "SET_DELETE_DIALOG", payload: true });
  }, []);

  // Confirm delete - memoized handler
  const confirmDelete = useCallback(async () => {
    if (!state.costumeToDelete || !userRolesData?.email) return;

    try {
      const preparedData = {
        productId: state.costumeToDelete.id,
        email: userRolesData.email,
        lenderId: userRolesData.user_id
      };

      // await deleteCostume(preparedData);
      dispatch({ type: "RESET_COSTUME_TO_DELETE" });
    } catch (error) {
      console.error('Error deleting costume:', error);
    }
  }, [state.costumeToDelete, userRolesData]);

  const handleSearchChange = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  const handleCategoryFilterChange = useCallback((category: string | null) => {
    dispatch({ type: "SET_CATEGORY_FILTER", payload: category });
  }, []);


  // New handler for status filter
  const handleStatusFilterChange = useCallback((status: string | null) => {
    dispatch({ type: "SET_STATUS_FILTER", payload: status });
  }, []);

  // New handler for gender filter
  const handleGenderFilterChange = useCallback((gender: string | null) => {
    dispatch({ type: "SET_GENDER_FILTER", payload: gender });
  }, []);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: "RESET_ALL_FILTERS" });
  }, []);

  const handleViewDialogChange = useCallback((isOpen: boolean) => {
    dispatch({ type: "SET_VIEW_DIALOG", payload: isOpen });
  }, []);

  return (
    <Card className="w-full shadow-md">
      <CardContent className="p-3 sm:p-6">
        <ProductHeader
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          categoryFilter={state.categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}

          categories={categories}
          // New props for status and gender filters
          statusFilter={state.statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          genderFilter={state.genderFilter}
          onGenderFilterChange={handleGenderFilterChange}
          statuses={statuses}
          genders={genders}
          onResetFilters={handleResetFilters}
        />

        <div className="space-y-4 mt-4 w-full">
          {/* Remove ScrollArea and min-width constraint for better mobile responsiveness */}
          <div className="w-full">
            <CostumeTableSection
              costumes={filteredAndSortedCostumes}
              sortConfig={state.sortConfig}
              onSort={handleSort}
              onViewCostume={handleViewCostume}
              onEditCostume={handleEditCostume}
              onDeleteCostume={handleDeleteCostume}
            />
          </div>

          {/* Pagination */}
          {costumes && costumes.length > 0 && (
            <CostumePaginationSection
              currentPage={1}
              totalPages={1}
              itemsPerPage={totalItems}
              totalItems={totalItems}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              hasNext={false}
              hasPrev={false}
              onPageChange={() => { }}
              onItemsPerPageChange={() => { }}
            />
          )}
        </div>
      </CardContent>

      {/* Costume Detail Dialog */}
      <Suspense fallback={<div className="p-4 text-center">Loading details...</div>}>
        <ProductDetailDialog
          product={state.selectedCostume}
          open={state.viewDialog}
          onOpenChange={handleViewDialogChange}
        />
      </Suspense>

      {/* Delete Confirmation Dialog (not implemented) */}
    </Card>
  );
};

export default CostumeListSection;