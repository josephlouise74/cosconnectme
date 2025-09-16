import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'

const PostImages = ({ images }: { images: string[] }) => {
    if (!images || images.length === 0) return null

    const imageCount = images.length

    if (imageCount === 1) {
        return (
            <div className="mt-3">
                <AspectRatio ratio={16 / 12} className="overflow-hidden rounded-lg">
                    <Image
                        src={images[0] as string}
                        alt="Post image"
                        fill
                        className="object-cover"
                    />
                </AspectRatio>
            </div>
        )
    }

    return (
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
            {images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square">
                    <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                    />
                    {imageCount > 4 && index === 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">+{imageCount - 4}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default PostImages 