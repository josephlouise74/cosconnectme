import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatOfferType } from '@/lib/utils';
import { CostumeAddOnType, CostumeItemTypeV2 } from "@/lib/types/marketplace/get-costume";
import {
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    Gem,
    Info,
    Package,
    Ruler,
    ShieldAlert,
    ShoppingBag,
    Tag,
    User
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface ProductDetailDialogProps {
    product: CostumeItemTypeV2 | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ProductDetailDialog = ({
    product,
    open,
    onOpenChange,
}: ProductDetailDialogProps) => {

    // Memoized status variant
    const statusVariant = useMemo(() => {
        if (!product) return 'secondary';
        switch (product.status) {
            case 'active': return 'default';
            case 'inactive': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    }, [product?.status]);

    // Memoized listing type display
    const listingTypeDisplay = useMemo(() => {
        if (!product) return null;

        const badges = [];

        if (product.listing_type === 'rent' || product.listing_type === 'both') {
            badges.push(
                <Badge key="rent" variant="secondary" className="mr-2">
                    Rent
                </Badge>
            );
        }

        if (product.listing_type === 'sale' || product.listing_type === 'both') {
            badges.push(
                <Badge key="sale" variant="secondary">
                    Sale
                </Badge>
            );
        }

        return (
            <div className="flex items-center">
                {badges}
            </div>
        );
    }, [product?.listing_type]);

    // Format date helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Render add-on card
    const renderAddOnCard = (addOn: CostumeAddOnType) => (
        <Card key={addOn.id} className="overflow-hidden">
            {addOn.image && (
                <div className="relative h-32 bg-gray-50">
                    <Image
                        src={addOn.image}
                        alt={addOn.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <h5 className="font-semibold text-sm mb-1">{addOn.name}</h5>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {addOn.description}
                </p>
                <p className="text-lg font-bold text-primary">₱{addOn.price}</p>
            </CardContent>
        </Card>
    );

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-5xl md:max-w-5xl p-2 md:p-8 max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl md:text-3xl">
                        <Package className="h-6 w-6 text-primary" />
                        Costume Details
                    </DialogTitle>
                    <DialogDescription className="text-base md:text-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span>Complete information about {product.name}</span>
                            {listingTypeDisplay}
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    {/* DETAILS TAB */}
                    <TabsContent value="details" className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Main Image - Always visible in details tab */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="relative h-56 md:h-80 w-full rounded-lg overflow-hidden bg-black">
                                        {product.main_images && product.main_images.front ? (
                                            <Image
                                                src={product.main_images.front}
                                                alt={product.name}
                                                fill
                                                className="object-contain"
                                                sizes="(max-inline-size: 640px) 95vw, 600px"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                                                No image available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Info className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Tag className="h-4 w-4" />
                                            Name
                                        </div>
                                        <p className="font-medium break-words">{product.name}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ShoppingBag className="h-4 w-4" />
                                            Brand
                                        </div>
                                        <p className="font-medium break-words">{product.brand}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                            Category
                                        </div>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            Gender
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {product.gender}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Ruler className="h-4 w-4" />
                                            Sizes
                                        </div>
                                        <p className="font-medium">{product.sizes || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                            Status
                                        </div>
                                        <Badge variant={statusVariant} className="capitalize">
                                            {product.status || 'pending'}
                                        </Badge>
                                    </div>

                                    <div className="sm:col-span-2 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                            Description
                                        </div>
                                        <p className="text-sm break-words">{product.description || 'No description available'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        Availability
                                    </div>
                                    <Badge variant={product.is_available ? 'default' : 'destructive'}>
                                        {product.is_available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        Selected Type
                                    </div>
                                    <p className="font-medium">{product.selected_costume_type || 'None'}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ShieldAlert className="h-4 w-4" />
                                        Security Deposit
                                    </div>
                                    <p className="font-medium">₱{product.security_deposit || '0'}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Extended Days
                                    </div>
                                    <p className="font-medium">{product.extended_days || '0'} days</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Created
                                    </div>
                                    <p className="text-sm">
                                        {formatDate(product.created_at)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Last Updated
                                    </div>
                                    <p className="text-sm">
                                        {formatDate(product.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Tag className="h-5 w-5" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>



                    {/* IMAGES TAB */}
                    <TabsContent value="images" className="space-y-6 pt-4">
                        {/* Main Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5" />
                                    Main Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Front Image */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Front View</p>
                                        <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                            {product.main_images && product.main_images.front ? (
                                                <Image
                                                    src={product.main_images.front}
                                                    alt={`${product.name} - Front View`}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                    No front image
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Back Image */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Back View</p>
                                        <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                            {product.main_images && product.main_images.back ? (
                                                <Image
                                                    src={product.main_images.back}
                                                    alt={`${product.name} - Back View`}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                    No back image
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Images */}
                        {product.additional_images && product.additional_images.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5" />
                                        Additional Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {product.additional_images
                                            .sort((a, b) => a.order - b.order)
                                            .map((img, idx) => (
                                                img.url && (
                                                    <div key={idx} className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Image {idx + 1}</p>
                                                        <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                                            <Image
                                                                src={img.url}
                                                                alt={`Additional image ${idx + 1}`}
                                                                fill
                                                                className="object-contain"
                                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full md:w-auto">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailDialog;