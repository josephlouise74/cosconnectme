"use client"
import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
    images: string[]
    className?: string
    onImageClick?: (index: number) => void
}

const ImageCarousel = ({ images, className, onImageClick }: ImageCarouselProps) => {
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

    if (!images || images.length === 0) return null

    const handleImageLoad = (index: number) => {
        setLoadedImages(prev => new Set(prev).add(index))
    }

    const handleImageClick = (index: number) => {
        if (onImageClick) {
            onImageClick(index)
        }
    }

    // Dynamic grid layout based on image count
    const getGridLayout = () => {
        const count = images.length

        if (count === 1) {
            return "grid-cols-1"
        } else if (count === 2) {
            return "grid-cols-2"
        } else if (count === 3) {
            return "grid-cols-2"
        } else if (count === 4) {
            return "grid-cols-2"
        } else {
            return "grid-cols-2"
        }
    }

    const getImageSpan = (index: number, total: number) => {
        if (total === 1) return "col-span-1 row-span-1 aspect-[4/3]"
        if (total === 2) return "col-span-1 row-span-1 aspect-square"
        if (total === 3) {
            return index === 0 ? "col-span-1 row-span-2 aspect-[3/4]" : "col-span-1 row-span-1 aspect-square"
        }
        if (total === 4) return "col-span-1 row-span-1 aspect-square"

        // For 5+ images
        if (index === 0) return "col-span-1 row-span-2 aspect-[3/4]"
        return "col-span-1 row-span-1 aspect-square"
    }

    const shouldShowOverlay = (index: number, total: number) => {
        return total > 4 && index === 3
    }

    const getOverlayCount = () => {
        return images.length - 4
    }

    return (
        <div className={cn("relative w-full", className)}>
            <div className={`grid ${getGridLayout()} gap-1 rounded-xl overflow-hidden`}>
                {images.slice(0, 4).map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative cursor-pointer group overflow-hidden transition-all duration-200",
                            getImageSpan(index, images.length)
                        )}
                        onClick={() => handleImageClick(index)}
                    >
                        {/* Loading skeleton */}
                        {!loadedImages.has(index) && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        )}

                        <Image
                            src={image}
                            alt={`Post image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onLoad={() => handleImageLoad(index)}
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.src = '/api/placeholder/400/320'
                            }}
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

                        {/* More images overlay */}
                        {shouldShowOverlay(index, images.length) && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-2xl font-semibold">
                                    +{getOverlayCount()}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Image count badge */}
            {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {images.length}
                </div>
            )}
        </div>
    )
}

export default ImageCarousel