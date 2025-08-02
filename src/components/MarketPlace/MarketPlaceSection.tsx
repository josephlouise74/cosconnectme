"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

// API Hooks
import { useFetchAllCategories } from '@/lib/api/categoryApi'
import { useGetAllCostumeForMarketPlace } from '@/lib/api/marketplaceApi'

// Auth Hook
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

// Types
import { Category } from '@/lib/types/categoryType'
import {
  CostumeItem,
  Gender
} from '@/lib/types/marketplaceType'

// Components
import CostumeGrid from './components/CostumeGrid'
import FilterSidebar from './components/FilterSidebar'
import MarketplacePagination from './components/MarketPlacePagination'
import SearchBar from './components/SearchBar'

// Schema
import { FilterFormValues, filterFormSchema } from './filterSchema'

// Constants
const ITEMS_PER_PAGE = 12
const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000]

// Filter configuration
interface MarketplaceFilters {
  search: string;
  category: string;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sort?: string;
}

interface CategoryCount {
  [key: string]: number
}

const MarketPlaceSection = () => {
  // State management
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const router = useRouter()

  // Use Supabase auth hook
  const { isAuthenticated, user, isLoading: authLoading, currentRole } = useSupabaseAuth()

  // Form setup with validation
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      search: '',
      category: '',
      priceRange: DEFAULT_PRICE_RANGE,
      tags: [],
      gender: '',
      sizes: [],
      color: '',
      sort: 'newest',
      deliveryOptions: []
    }
  })

  const filters = form.watch()

  // Helper functions
  const getCostumePrice = useCallback((costume: CostumeItem): number => {
    const prices: number[] = []

    if (costume.rent?.main_rent_offer?.price) {
      prices.push(parseFloat(costume.rent.main_rent_offer.price))
    }

    if (costume.sale?.price) {
      const basePrice = parseFloat(costume.sale.price)
      const discountedPrice = basePrice * (1 - costume.sale.discount / 100)
      prices.push(discountedPrice)
    }

    return prices.length ? Math.min(...prices) : 0
  }, [])

  const applyClientFilters = useCallback((
    costume: CostumeItem,
    filterValues: FilterFormValues
  ): boolean => {
    // Search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase()
      const searchableContent = [
        costume.name,
        costume.brand,
        costume.category,
        costume.description,
        ...costume.tags
      ].join(' ').toLowerCase()

      if (!searchableContent.includes(searchTerm)) return false
    }

    // Price range filter
    if (filterValues.priceRange) {
      const [minPrice, maxPrice] = filterValues.priceRange
      const costumePrice = getCostumePrice(costume)

      if (costumePrice < minPrice || costumePrice > maxPrice) return false
    }

    // Tags filter
    if (filterValues.tags?.length) {
      const hasMatchingTag = filterValues.tags.some(filterTag =>
        costume.tags.some(costumeTag =>
          costumeTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
      if (!hasMatchingTag) return false
    }

    // Size filter
    if (filterValues.sizes?.length) {
      const costumeSize = costume.sizes.toLowerCase()
      const hasMatchingSize = filterValues.sizes.some(size =>
        costumeSize.includes(size.toLowerCase())
      )
      if (!hasMatchingSize) return false
    }

    return true
  }, [getCostumePrice])

  const applySorting = useCallback((
    a: CostumeItem,
    b: CostumeItem,
    sortOption: string
  ): number => {
    switch (sortOption) {
      case 'price-low':
        return getCostumePrice(a) - getCostumePrice(b)
      case 'price-high':
        return getCostumePrice(b) - getCostumePrice(a)
      case 'popular':
        // TODO: Implement popularity logic when available
        return 0
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  }, [getCostumePrice])

  // API calls
  const marketplaceFilters: MarketplaceFilters = useMemo(() => ({
    category: filters.category || '',
    gender: (filters.gender as Gender) || undefined,
    search: filters.search || '',
    minPrice: filters.priceRange?.[0],
    maxPrice: filters.priceRange?.[1],
    ...(filters.tags?.length ? { tags: filters.tags } : {}),
    sort: filters.sort || 'newest',
  }), [filters])

  const {
    data: costumeData,
    isLoading: isLoadingCostumes,
    isError,
    error,
    refetch
  } = useGetAllCostumeForMarketPlace({
    enabled: true,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    filters: marketplaceFilters
  })

  // Extract data from the hook response
  const allCostumes = costumeData?.data || []
  const pagination = costumeData?.pagination

  const {
    data: categoriesData,
    isLoading: isLoadingCategories
  } = useFetchAllCategories({
    page: 1,
    limit: 100
  })

  // Computed values
  const priceRange: [number, number] = useMemo(() => {
    if (!allCostumes?.length) return DEFAULT_PRICE_RANGE

    const prices = allCostumes.flatMap((costume: CostumeItem) => {
      const costumesPrices: number[] = []

      // Extract rent prices
      if (costume.rent?.main_rent_offer?.price) {
        costumesPrices.push(parseFloat(costume.rent.main_rent_offer.price))
      }

      costume.rent?.alternative_rent_offers?.forEach(offer => {
        if (offer.price) {
          costumesPrices.push(parseFloat(offer.price))
        }
      })

      // Extract sale price with discount
      if (costume.sale?.price) {
        const basePrice = parseFloat(costume.sale.price)
        const discountedPrice = basePrice * (1 - costume.sale.discount / 100)
        costumesPrices.push(discountedPrice)
      }

      return costumesPrices
    })

    return prices.length
      ? [Math.min(...prices), Math.max(...prices)]
      : DEFAULT_PRICE_RANGE
  }, [allCostumes])

  const categoryCounts: CategoryCount = useMemo(() => {
    if (!allCostumes?.length) return { all: 0 }

    const counts: CategoryCount = { all: allCostumes.length }

    allCostumes.forEach((costume: CostumeItem) => {
      const categoryName = costume.category
      counts[categoryName] = (counts[categoryName] || 0) + 1
    })

    return counts
  }, [allCostumes])

  // Client-side filtering and sorting
  const processedCostumes = useMemo(() => {
    if (!allCostumes?.length) return []

    return allCostumes
      .filter((costume: CostumeItem) => applyClientFilters(costume, filters))
      .sort((a: CostumeItem, b: CostumeItem) => applySorting(a, b, filters.sort))
  }, [allCostumes, filters, applyClientFilters, applySorting])

  // Event handlers
  const handleCategorySelect = useCallback((category: string) => {
    form.setValue('category', category === 'all' ? '' : category as any)
    setCurrentPage(1)
  }, [form])

  const handleAddToWishlist = useCallback((costumeId: string) => {
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }

    // Log current user info for debugging
    console.log('Current user:', user)
    console.log('Current role:', currentRole)
    console.log('Adding to wishlist:', costumeId)

    // TODO: Implement wishlist API integration
    // You can now use user.id, currentRole, etc.
  }, [isAuthenticated, router, user, currentRole])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleFilterSidebar = useCallback(() => {
    setIsFilterOpen(prev => !prev)
  }, [])

  // Loading state - include auth loading
  if (authLoading || isLoadingCostumes || isLoadingCategories) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error?.message || 'Failed to load marketplace'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <header className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Cosplay Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover amazing costumes for rent or purchase
              </p>
            </div>

            <Button
              variant="outline"
              onClick={toggleFilterSidebar}
              className="hidden md:flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <SearchBar
            search={filters.search}
            form={form}
            onFilter={toggleFilterSidebar}
          />
        </header>

        {/* Category Navigation */}
        <nav className="flex overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-2 min-w-max">
            <Badge
              variant={!filters.category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
              onClick={() => handleCategorySelect('all')}
            >
              All ({categoryCounts.all || 0})
            </Badge>

            {categoriesData?.data?.categories?.map((category: Category) => (
              <Badge
                key={category.id}
                variant={filters.category === category.categoryName ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-primary/90 transition-colors"
                onClick={() => handleCategorySelect(category.categoryName)}
              >
                {category.categoryName} ({categoryCounts[category.categoryName] || 0})
              </Badge>
            ))}
          </div>
        </nav>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium text-foreground">
              {processedCostumes.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">
              {pagination?.totalItems || 0}
            </span>{' '}
            results
            {pagination && pagination.totalPages > 1 && (
              <span className="ml-2">
                • Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <CostumeGrid
            costumes={processedCostumes}
            loading={isLoadingCostumes}
            error={isError ? (error as any)?.message || 'Failed to load costumes' : null}
            onAddToWishlist={handleAddToWishlist}
            onFilterToggle={toggleFilterSidebar}
            onRetry={refetch}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <MarketplacePagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        form={form}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        minMaxPrice={priceRange}
      />
    </div>
  )
}

export default MarketPlaceSection