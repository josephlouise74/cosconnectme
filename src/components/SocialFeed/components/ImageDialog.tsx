"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ImageDialogProps {
    images: string[]
    isOpen: boolean
    onClose: () => void
    initialIndex?: number
}

const ImageDialog = ({ images, isOpen, onClose, initialIndex = 0 }: ImageDialogProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Reset state when dialog opens/closes or initial index changes
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
            setIsLoading(true)
            setHasError(false)
        }
    }, [initialIndex, isOpen])

    // Reset loading state when current index changes
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            setHasError(false)
        }
    }, [currentIndex, isOpen])

    const handleImageLoad = useCallback(() => {
        setIsLoading(false)
    }, [])

    const handleImageError = useCallback(() => {
        setHasError(true)
        setIsLoading(false)
    }, [])

    const handlePrevious = useCallback(() => {
        if (images.length > 1) {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
        }
    }, [images.length])

    const handleNext = useCallback(() => {
        if (images.length > 1) {
            setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
        }
    }, [images.length])

    // Touch handlers for mobile swipe
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0]?.clientX as any)
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0]?.clientX as any)
    }, [])

    const handleTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe && images.length > 1) {
            handleNext()
        }
        if (isRightSwipe && images.length > 1) {
            handlePrevious()
        }
    }, [touchStart, touchEnd, images.length, handleNext, handlePrevious])

    // Keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!isOpen) return

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault()
                handlePrevious()
                break
            case 'ArrowRight':
                event.preventDefault()
                handleNext()
                break
            case 'Escape':
                event.preventDefault()
                onClose()
                break
        }
    }, [isOpen, handlePrevious, handleNext, onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Prevent body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!images || images.length === 0) return null

    const currentImage = images[currentIndex]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
            <DialogContent
                className="max-w-none w-screen h-screen p-0 border-none bg-black shadow-none flex items-center justify-center overflow-hidden"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogTitle asChild>
                    <VisuallyHidden>
                        Image viewer - {currentIndex + 1} of {images.length}
                    </VisuallyHidden>
                </DialogTitle>

                {/* Header with close button and counter */}
                <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center">
                        {images.length > 1 && (
                            <div className="flex items-center space-x-1">
                                {images.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'bg-white w-6'
                                            : 'bg-white/40 w-1.5'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer bg-white h-10 w-10"
                        onClick={onClose}
                    >
                        <X className="w-6 h-6 text-black" />
                    </Button>
                </div>

                {/* Main image container */}
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Navigation buttons for desktop */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 transition-all duration-200 h-12 w-12 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                onClick={handlePrevious}
                                style={{ opacity: 1 }}
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 transition-all duration-200 h-12 w-12 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                onClick={handleNext}
                                style={{ opacity: 1 }}
                            >
                                <ChevronRight className="w-7 h-7" />
                            </Button>
                        </>
                    )}

                    {/* Image container */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}

                        {hasError ? (
                            <div className="flex flex-col items-center justify-center text-white/70 space-y-3">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                    <X className="w-8 h-8" />
                                </div>
                                <p className="text-sm">Unable to load image</p>
                            </div>
                        ) : (
                            <div className="relative max-w-full max-h-full">
                                <Image
                                    src={currentImage as string || ""}
                                    alt={`Image ${currentIndex + 1} of ${images.length}`}
                                    width={1200}
                                    height={800}
                                    className="max-w-full max-h-[calc(100vh-8rem)] object-contain transition-opacity duration-300"
                                    style={{
                                        opacity: isLoading ? 0 : 1,
                                    }}
                                    priority
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    draggable={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom gradient for mobile gesture hint */}
                {images.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ImageDialog