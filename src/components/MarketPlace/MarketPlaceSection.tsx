"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

// API Hooks
import { useFetchAllCategories } from '@/lib/api/categoryApi'


// Auth Hook
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

// Types
import { Category } from '@/lib/types/categoryType'
import { MarketplaceCostume } from '@/lib/types/marketplaceType'

// Components
import CostumeGrid from './components/CostumeGrid'
import FilterSidebar from './components/FilterSidebar'
import MarketplacePagination from './components/MarketPlacePagination'
import SearchBar from './components/SearchBar'

// Schema
import { useGetAllCostumeForMarketPlace } from '@/lib/api/marketplaceApi'
import { FilterFormValues, filterFormSchema } from './filterSchema'

// Constants
const ITEMS_PER_PAGE = 12
const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000]

// Filter configuration
interface MarketplaceFilters {
    search?: string;
    category?: string;
    gender?: string;
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
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchSubmitted, setIsSearchSubmitted] = useState(false)


    // Use Supabase auth hook
    const { isLoading: authLoading, } = useSupabaseAuth()

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
    const getCostumePrice = useCallback((costume: MarketplaceCostume): number => {
        // Extract rental price
        if (costume.pricing?.rental?.price) {
            return parseFloat(costume.pricing.rental.price)
        }

        // Extract sale price
        if (costume.pricing?.sale?.price) {
            return parseFloat(costume.pricing.sale.price)
        }

        return 0
    }, [])

    const applyClientFilters = useCallback((
        costume: MarketplaceCostume,
        filterValues: FilterFormValues
    ): boolean => {
        // Search filter
        if (filterValues.search && filterValues.search.trim()) {
            const searchTerm = filterValues.search.toLowerCase().trim()
            const searchableContent = [
                costume.name || '',
                costume.brand || '',
                costume.category || '',
                ...(costume.tags || [])
            ].join(' ').toLowerCase()

            if (!searchableContent.includes(searchTerm)) return false
        }

        // Category filter
        if (filterValues.category && filterValues.category.trim()) {
            if (costume.category !== filterValues.category) {
                return false
            }
        }

        // Gender filter
        if (filterValues.gender && filterValues.gender.trim()) {
            if (costume.gender !== filterValues.gender) {
                return false
            }
        }

        // Price range filter
        if (filterValues.priceRange && Array.isArray(filterValues.priceRange)) {
            const [minPrice, maxPrice] = filterValues.priceRange
            const costumePrice = getCostumePrice(costume)

            if (costumePrice < minPrice || costumePrice > maxPrice) return false
        }

        // Tags filter
        if (filterValues.tags && filterValues.tags.length > 0) {
            const hasMatchingTag = filterValues.tags.some(filterTag =>
                costume.tags?.some(costumeTag =>
                    costumeTag.toLowerCase().includes(filterTag.toLowerCase())
                )
            )
            if (!hasMatchingTag) return false
        }

        // Size filter
        if (filterValues.sizes && filterValues.sizes.length > 0) {
            const costumeSize = (costume.sizes || '').toLowerCase()
            const hasMatchingSize = filterValues.sizes.some(size =>
                costumeSize.includes(size.toLowerCase())
            )
            if (!hasMatchingSize) return false
        }

        return true
    }, [getCostumePrice])

    const applySorting = useCallback((
        a: MarketplaceCostume,
        b: MarketplaceCostume,
        sortOption: string
    ): number => {
        switch (sortOption) {
            case 'price-low':
                return getCostumePrice(a) - getCostumePrice(b)
            case 'price-high':
                return getCostumePrice(b) - getCostumePrice(a)
            case 'popular':
                return (b.favorite_count || 0) - (a.favorite_count || 0)
            case 'most-viewed':
                return (b.view_count || 0) - (a.view_count || 0)
            case 'newest':
            default:
                const dateA = new Date(a.created_at || '').getTime()
                const dateB = new Date(b.created_at || '').getTime()
                return dateB - dateA
        }
    }, [getCostumePrice])

    // Prepare API filters (without search)
    const marketplaceFilters: MarketplaceFilters = useMemo(() => {
        const apiFilters: MarketplaceFilters = {}

        // Don't include search in API filters - we'll handle it client-side
        if (filters.category && filters.category.trim()) {
            apiFilters.category = filters.category
        }

        if (filters.gender && filters.gender.trim()) {
            apiFilters.gender = filters.gender
        }

        if (filters.priceRange && Array.isArray(filters.priceRange)) {
            const [minPrice, maxPrice] = filters.priceRange
            if (minPrice > 0) apiFilters.minPrice = minPrice
            if (maxPrice < 10000) apiFilters.maxPrice = maxPrice
        }

        if (filters.tags && filters.tags.length > 0) {
            apiFilters.tags = filters.tags
        }

        if (filters.sort && filters.sort.trim()) {
            apiFilters.sort = filters.sort
        }

        return apiFilters
    }, [filters])

    // API calls
    const {
        costumes,
        pagination,
        isLoading: isLoadingCostumes,
        isError,
        error,
        refetch,
        isSuccess
    } = useGetAllCostumeForMarketPlace({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        filters: marketplaceFilters,
        enabled: true
    })

    const {
        data: categoriesData,
        isLoading: isLoadingCategories
    } = useFetchAllCategories({
        page: 1,
        limit: 100
    })

    // Computed values
    const priceRange: [number, number] = useMemo(() => {
        if (!costumes || costumes.length === 0) return DEFAULT_PRICE_RANGE

        const prices = costumes.reduce((acc: number[], costume: MarketplaceCostume) => {
            const price = getCostumePrice(costume)
            if (price > 0) acc.push(price)
            return acc
        }, [])

        return prices.length > 0
            ? [Math.min(...prices), Math.max(...prices)]
            : DEFAULT_PRICE_RANGE
    }, [costumes, getCostumePrice])

    const categoryCounts: CategoryCount = useMemo(() => {
        if (!costumes || costumes.length === 0) return { all: 0 }

        const counts: CategoryCount = { all: costumes.length }

        costumes.forEach((costume: MarketplaceCostume) => {
            const categoryName = costume.category || 'Unknown'
            counts[categoryName] = (counts[categoryName] || 0) + 1
        })

        return counts
    }, [costumes])

    // Client-side search and filtering
    const processedCostumes = useMemo(() => {
        if (!costumes || costumes.length === 0) return []

        let result = [...costumes]

        // Apply search filter if search was submitted and has value
        if (isSearchSubmitted && searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim()
            result = result.filter(costume => {
                const searchableContent = [
                    costume.name || '',
                    costume.brand || '',
                    costume.category || '',
                    ...(costume.tags || [])
                ].join(' ').toLowerCase()
                return searchableContent.includes(searchTerm)
            })
        }

        // Apply other filters
        const filterValues = { ...filters, search: searchQuery }
        result = result.filter(costume => applyClientFilters(costume, filterValues))

        // Apply sorting
        return result.sort((a, b) => applySorting(a, b, filters.sort || 'newest'))
    }, [costumes, filters, searchQuery, isSearchSubmitted, applyClientFilters, applySorting])

    // Event handlers
    const handleCategorySelect = useCallback((category: string) => {
        form.setValue('category', category === 'all' ? '' : category as any)
        setCurrentPage(1)
    }, [form])

    const handleSearch = useCallback(() => {
        setSearchQuery(filters.search || '')
        setIsSearchSubmitted(true)
        setCurrentPage(1)
    }, [filters.search])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const toggleFilterSidebar = useCallback(() => {
        setIsFilterOpen(prev => !prev)
    }, [])

    // Loading state
    if (authLoading || isLoadingCostumes || isLoadingCategories) {
        return (
            <div className="min-h-screen flex justify-center items-center">
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

    // No data state
    if (isSuccess && (!costumes || costumes.length === 0)) {
        return (
            <div className="container mx-auto py-20 flex justify-center items-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No costumes found</h3>
                    <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search terms
                    </p>
                    <Button
                        onClick={() => {
                            form.reset()
                            setCurrentPage(1)
                        }}
                        variant="outline"
                    >
                        Clear Filters
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
                        search={filters.search || ''}
                        form={form}
                        onFilter={handleSearch}
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
                            {pagination?.total_count || 0}
                        </span>{' '}
                        results
                        {pagination && pagination.total_pages > 1 && (
                            <span className="ml-2">
                                • Page {pagination.page} of {pagination.total_pages}
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

                        onFilterToggle={toggleFilterSidebar}
                        onRetry={refetch}
                    />

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
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