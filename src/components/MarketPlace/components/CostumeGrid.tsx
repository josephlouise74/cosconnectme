// components/CostumeGrid.tsx
import { Button } from '@/components/ui/button'
import { MarketplaceCostume } from '@/lib/types/marketplaceType'
import { SlidersHorizontal, AlertCircle, Monitor } from 'lucide-react'
import CostumeCard from './CostumeCard'

interface CostumeGridProps {
    costumes: MarketplaceCostume[]
    loading: boolean
    error: string | null
    onRetry: () => void
    onFilterToggle: () => void
}

const CostumeGrid = ({
    costumes,
    loading,
    error,
    onRetry,
    onFilterToggle,
}: CostumeGridProps) => {
    // Loading state
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-2 md:p-4 bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 rounded-xl overflow-hidden animate-pulse min-h-[420px] flex flex-col"
                    >
                        <div className="aspect-[3/4] bg-gray-200" />
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-end">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-6 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-8 bg-gray-200 rounded w-full" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <AlertCircle className="mb-4 text-red-500 h-12 w-12" />
                <h3 className="text-lg font-semibold mb-2">Failed to load costumes</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={onRetry}>Try Again</Button>
            </div>
        )
    }

    // Empty state
    if (costumes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Monitor className="mb-4 text-muted-foreground h-12 w-12" />
                <h3 className="text-lg font-semibold mb-2">No costumes found</h3>
                <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                </p>
                <Button onClick={onFilterToggle}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Adjust Filters
                </Button>
            </div>
        )
    }

    // Display costumes grid
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-2 md:p-4 bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
            {costumes.map((costume, idx) => (
                <div
                    key={costume.id}
                    className="h-full flex flex-col animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                >
                    <CostumeCard costume={costume} />
                </div>
            ))}
        </div>
    )
}

export default CostumeGrid
