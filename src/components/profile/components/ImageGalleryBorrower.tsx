"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

// Dummy data for testing
export const dummyGalleryImages = [
    {
        id: '1',
        url: 'https://source.unsplash.com/random/600x400?cosplay=1',
        alt: 'Cosplay image 1',
        postId: 'post1'
    },
    {
        id: '2',
        url: 'https://source.unsplash.com/random/600x400?cosplay=2',
        alt: 'Cosplay image 2',
        postId: 'post2'
    },
    {
        id: '3',
        url: 'https://source.unsplash.com/random/600x400?cosplay=3',
        alt: 'Cosplay image 3',
        postId: 'post3'
    },
    {
        id: '4',
        url: 'https://source.unsplash.com/random/600x400?cosplay=4',
        alt: 'Cosplay image 4',
        postId: 'post4'
    },
    {
        id: '5',
        url: 'https://source.unsplash.com/random/600x400?cosplay=5',
        alt: 'Cosplay image 5',
        postId: 'post5'
    },
    {
        id: '6',
        url: 'https://source.unsplash.com/random/600x400?cosplay=6',
        alt: 'Cosplay image 6',
        postId: 'post6'
    }
]
type GalleryImage = {
    id: string
    url: string
    alt: string
    postId: string
}

type ImageGalleryBorrowerProps = {
    images?: GalleryImage[]
    className?: string
    username?: string
}

const ImageGalleryBorrower = ({
    images = dummyGalleryImages,
    className,
    username = 'user'
}: ImageGalleryBorrowerProps) => {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    return (
        <div className={cn("mt-6 space-y-4 rounded-lg p-4 shadow-sm", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Gallery</h3>
                {images.length > 0 && (
                    <Link
                        href={`/borrower/${username}/gallery`}
                        className="text-sm text-rose-500 flex items-center gap-1 group transition-colors"
                    >
                        <span>See All Gallery</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {images.slice(0, 6).map((image) => (
                        <div
                            key={image.id}
                            className="relative aspect-square overflow-hidden rounded-md cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                        >
                            <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 768px) 33vw, 20vw"
                                className="object-cover hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No gallery images yet</p>
                </div>
            )}

            {images.length > 6 && (
                <div className="flex justify-center">
                    <Link
                        href={`/borrower/${username}/gallery`}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 group transition-colors"
                    >
                        <span>View {images.length - 6} more photos</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}

            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
                    {selectedImage && (
                        <div className="relative w-full aspect-video">
                            <Image
                                src={selectedImage.url}
                                alt={selectedImage.alt}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ImageGalleryBorrower