import { Button } from '@/components/ui/button'
import { CostumeItem } from '@/lib/types/marketplaceType'
import { SlidersHorizontal } from 'lucide-react'
import CostumeCard from './CostumeCard'

interface CostumeGridProps {
  costumes: CostumeItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onAddToWishlist: (costumeId: string) => void
  onFilterToggle: () => void
}

const CostumeGrid = ({
  costumes,
  loading,
  error,
  onRetry,
  onAddToWishlist,
  onFilterToggle
}: CostumeGridProps) => {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-2 md:p-4 bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse min-h-[420px] flex flex-col">
            <div className="aspect-[3/4] bg-gray-200"></div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-end">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
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
        <div className="mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
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
        <div className="mb-4 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No costumes found</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
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
          <CostumeCard
            costume={costume}
            onAddToWishlist={onAddToWishlist}
          />
        </div>
      ))}
    </div>
  )
}

export default CostumeGrid