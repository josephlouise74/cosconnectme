"use client"
// ImageGallery.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    costume: any;
}

interface ImageState {
    loading: boolean;
    error: boolean;
    loaded: boolean;
}

const ImageGallery = React.memo(({ costume }: ImageGalleryProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [imageStates, setImageStates] = useState<Record<number, ImageState>>({});

    // Memoize all images with proper ordering
    const allImages = useMemo(() => {
        const images: { url: string; order: number; type: 'main' | 'additional' }[] = [];
        if (costume.main_images?.front) {
            images.push({ url: costume.main_images.front, order: 0, type: 'main' });
        }
        if (costume.main_images?.back) {
            images.push({ url: costume.main_images.back, order: 1, type: 'main' });
        }
        if (costume.additional_images && costume.additional_images.length > 0) {
            const additionalImages = costume.additional_images
                .map((img: any) => ({ url: img.url, order: img.order + 2, type: 'additional' as const }))
                .sort((a: any, b: any) => a.order - b.order);
            images.push(...additionalImages);
        }
        return images;
    }, [costume.main_images, costume.additional_images]);

    React.useEffect(() => {
        const initialStates: Record<number, ImageState> = {};
        allImages.forEach((_, index) => {
            initialStates[index] = { loading: true, error: false, loaded: false };
        });
        setImageStates(initialStates);
    }, [allImages]);

    const goToNext = useCallback(() => {
        if (allImages.length <= 1) return;
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }, [allImages.length]);

    const goToPrevious = useCallback(() => {
        if (allImages.length <= 1) return;
        setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }, [allImages.length]);

    const handleImageLoad = useCallback((index: number) => {
        setImageStates(prev => ({
            ...prev,
            [index]: { loading: false, error: false, loaded: true }
        }));
    }, []);

    const handleImageError = useCallback((index: number) => {
        setImageStates(prev => ({
            ...prev,
            [index]: { loading: false, error: true, loaded: false }
        }));
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious();
            } else if (event.key === 'ArrowRight') {
                goToNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext]);

    const currentImage = allImages[selectedImageIndex];
    const currentImageState = imageStates[selectedImageIndex];

    if (allImages.length === 0) {
        return (
            <Card className="mb-8 p-4 border-0 shadow-sm">
                <div className="w-full h-96 rounded-xl mb-4 overflow-hidden bg-accent/50 flex items-center justify-center">
                    <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No images available</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mb-8 p-4 border-0 shadow-sm">
            <div className="relative">
                <motion.div
                    className="w-full h-96 rounded-xl mb-4 overflow-hidden bg-accent/50 relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <AnimatePresence mode="wait">
                        {currentImage && (
                            <motion.div
                                key={selectedImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full relative"
                            >
                                {currentImageState?.loading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-accent/50">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                                    </div>
                                )}
                                {currentImageState?.error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-accent/50">
                                        <div className="text-center">
                                            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground text-sm">Failed to load image</p>
                                        </div>
                                    </div>
                                )}
                                {!currentImageState?.error && (
                                    <Image
                                        src={currentImage.url}
                                        alt={`${costume.name} - ${currentImage.type === 'main' ? 'Main' : 'Additional'} view ${selectedImageIndex + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-contain"
                                        priority={selectedImageIndex === 0}
                                        onLoad={() => handleImageLoad(selectedImageIndex)}
                                        onError={() => handleImageError(selectedImageIndex)}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                {allImages.length > 1 && (
                    <>
                        <Button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-rose-600/90 shadow-md flex items-center justify-center hover:bg-rose-700 transition-all cursor-pointer z-10"
                            aria-label="Previous image"
                            variant="ghost"
                        >
                            <ChevronLeft size={20} className='text-white' />
                        </Button>
                        <Button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-rose-600/90 shadow-md flex items-center justify-center hover:bg-rose-700 transition-all cursor-pointer z-10"
                            aria-label="Next image"
                            variant="ghost"
                        >
                            <ChevronRight size={20} className='text-white' />
                        </Button>
                    </>
                )}
                {allImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {selectedImageIndex + 1} / {allImages.length}
                    </div>
                )}
            </div>
            {/* Thumbnails */}
            {allImages.length > 0 && (
                <div className="relative">
                    <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent">
                        {allImages.map((image, index) => {
                            const imageState = imageStates[index];
                            return (
                                <motion.div
                                    key={index}
                                    className={cn(
                                        "flex-shrink-0 w-20 h-20 bg-accent/50 rounded-md cursor-pointer overflow-hidden transition-all relative",
                                        index === selectedImageIndex
                                            ? "ring-2 ring-rose-500 scale-105 z-10"
                                            : "ring-1 ring-border hover:ring-rose-200"
                                    )}
                                    onClick={() => setSelectedImageIndex(index)}
                                    whileHover={{ scale: index === selectedImageIndex ? 1.05 : 1.03 }}
                                >
                                    {imageState?.loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-accent/50">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                                        </div>
                                    )}
                                    {imageState?.error && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-accent/50">
                                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    {!imageState?.error && (
                                        <Image
                                            src={image.url}
                                            alt={`${costume.name} thumbnail ${index + 1}`}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                            onLoad={() => handleImageLoad(index)}
                                            onError={() => handleImageError(index)}
                                        />
                                    )}
                                    <div className="absolute top-1 left-1">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs px-1 py-0 h-4 bg-black/50 text-white border-0"
                                        >
                                            {image.type === 'main' ? 'M' : 'A'}
                                        </Badge>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;

