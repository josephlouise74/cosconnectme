
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Heart, MapPin, Tag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

interface FeaturedCustomeSectionProps {
    costumes: any[];
    isLoading: boolean;
    error?: any;
}

const FeaturedCustomeSection = ({ costumes, isLoading, error }: FeaturedCustomeSectionProps) => {
    const [hoveredCostume, setHoveredCostume] = React.useState<string | null>(null);
    const router = useRouter()


    // Helper function to format price
    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(parseFloat(price));
    };

    if (isLoading) {
        return (
            <section className="py-16 w-full">
                <div className="w-full mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Featured Costumes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <CardHeader className="pb-2">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                </CardContent>
                                <CardFooter>
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    if (error || !costumes) {
        return (
            <section className="py-16 w-full">
                <div className="w-full mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Featured Costumes</h2>
                    <p className="text-text-muted">Failed to load costume data. Please try again later.</p>
                </div>
            </section>
        );
    }

    const handleRentNowInfo = async (product: any) => {
        try {
            const slugifiedName = slugify(product.name);
            const slugifiedCategory = slugify(product.category);
            const slugifiedTags = product.tags.map((tag: any) => slugify(tag)).join(',');

            const query = new URLSearchParams({
                id: product.id,
                category: slugifiedCategory,
                tags: slugifiedTags,
            });

            router.push(`/costumes/${slugifiedName}?${query.toString()}`);
        } catch (error) {
            console.error("Error navigating to product:", error);
        }
    }

    return (
        <section className={cn(
            "py-16 w-full",
            "bg-background dark:bg-background-dark",
            "border-t border-border dark:border-border-dark"
        )}>
            <div className="w-full mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className={cn(
                        "text-3xl font-bold font-heading",
                        "text-text dark:text-text-dark"
                    )}>
                        Featured Costumes
                    </h2>
                    <Button
                        variant="ghost"
                        className={cn(
                            "gap-2",
                            "hover:bg-rose-600 hover:text-white",
                            "dark:hover:bg-rose-600 dark:hover:text-white",
                            "transition-colors duration-300"
                        )}
                    >
                        View All <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {costumes.map((costume) => (
                        <Card
                            key={costume.id}
                            className={cn(
                                "overflow-hidden group",
                                "bg-card dark:bg-card-dark",
                                "border border-border dark:border-border-dark h-full",
                                "hover:border-rose-600 hover:shadow-lg flex flex-col justify-between",
                                "transition-all duration-300"
                            )}
                            onMouseEnter={() => setHoveredCostume(costume.id)}
                            onMouseLeave={() => setHoveredCostume(null)}
                        >
                            <div className={cn(
                                "relative h-48",
                                "bg-background dark:bg-background-dark",
                                "overflow-hidden"
                            )}>
                                <Image
                                    src={hoveredCostume === costume.id
                                        ? costume.mainImages.back || costume.mainImages.front
                                        : costume.mainImages.front}
                                    alt={costume.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button className={cn(
                                        "p-2",
                                        "bg-white/80 dark:bg-black/80",
                                        "backdrop-blur-sm rounded-full cursor-pointer",
                                        "hover:bg-rose-600 hover:text-white",
                                        "dark:hover:bg-rose-600 dark:hover:text-white",
                                        "transition-colors duration-300"
                                    )}>
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                </div>
                                {costume.discount > 0 && (
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-rose-600 text-white">
                                            {costume.discount}% OFF
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className={cn(
                                            "text-lg",
                                            "text-text dark:text-text-dark",
                                            "group-hover:text-rose-600",
                                            "transition-colors duration-300"
                                        )}>
                                            {costume.name}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge className={cn(
                                                "bg-background dark:bg-background-dark",
                                                "text-text dark:text-text-dark",
                                                "group-hover:bg-rose-100 group-hover:text-rose-700",
                                                "dark:group-hover:bg-rose-900 dark:group-hover:text-rose-300",
                                                "transition-colors duration-300"
                                            )}>
                                                {costume.category}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">
                                                {costume.gender}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-semibold text-rose-600">
                                            {formatPrice(costume.mainOffer.price)}
                                        </p>
                                        {costume.discount > 0 && (
                                            <p className="text-sm text-text-muted line-through">
                                                {formatPrice((parseFloat(costume.mainOffer.price) * (1 + costume.discount / 100)).toString())}
                                            </p>
                                        )}
                                    </div>
                                    {/*  <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {PRODUCT_TYPES.find(type => type.value === product.mainOffer.type)?.label || product.mainOffer.type}
                                        </Badge>
                                        <span className="text-sm text-text-muted dark:text-text-muted-dark">
                                            {product.mainOffer.name}
                                        </span>
                                    </div> */}
                                </div>

                                <p className="text-sm text-text-muted dark:text-text-muted-dark line-clamp-2">
                                    {costume.description}
                                </p>


                                <div className="flex items-center gap-2 text-sm text-text-muted dark:text-text-muted-dark">
                                    <MapPin className="h-4 w-4" />
                                    <span className="line-clamp-1">
                                        {costume.lenderUser.city.name}, {costume.lenderUser.province}
                                    </span>
                                </div>

                                {costume.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {costume.tags.slice(0, 3).map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {tag}
                                            </Badge>
                                        ))}
                                        {costume.tags.length > 3 && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                +{costume.tags.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={cn(
                                        "w-full",
                                        "bg-primary dark:bg-primary-dark",
                                        "text-primary-foreground dark:text-primary-foreground-dark",
                                        "hover:bg-rose-600 hover:text-white",
                                        "dark:hover:bg-rose-600 dark:hover:text-white",
                                        "transition-colors duration-300 cursor-pointer"
                                    )}
                                    onClick={() => handleRentNowInfo(costume)}
                                >
                                    Rent Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default React.memo(FeaturedCustomeSection)