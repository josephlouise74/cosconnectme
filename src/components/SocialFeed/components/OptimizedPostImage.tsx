"use client";

import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';

interface OptimizedPostImageProps {
    src: string;
    alt: string;
    index: number;
    className?: string; // Added to support custom sizing/styling from parent
}

const OptimizedPostImage = React.memo(
    ({ src, alt, index, className = '' }: OptimizedPostImageProps) => {
        const [isLoading, setIsLoading] = useState(true);
        const [hasError, setHasError] = useState(false);

        const handleLoad = useCallback(() => {
            setIsLoading(false);
        }, []);

        const handleError = useCallback(() => {
            setIsLoading(false);
            setHasError(true);
        }, []);

        return (
            <div className={`relative flex-shrink-0 w-full h-full`}>
                {isLoading && (
                    <Skeleton className="absolute inset-0 rounded-lg bg-gray-200" />
                )}
                {hasError ? (
                    <div
                        className={`bg-gray-200 rounded-lg flex items-center justify-center ${className || 'w-24 h-24'
                            }`}
                    >
                        <span className="text-xs text-gray-500">Failed to load</span>
                    </div>
                ) : (
                    <Image
                        key={index}
                        src={src}
                        alt={alt}
                        layout="fill" // Use fill layout to adapt to parent container size
                        className={`rounded-lg object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                        onLoad={handleLoad}
                        onError={handleError}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/2Q=="
                    />
                )}
            </div>
        );
    }
);

OptimizedPostImage.displayName = 'OptimizedPostImage';
export default OptimizedPostImage;