import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    Clock,
    Info,
    Package,
    Ruler,
    ShieldAlert,
    ShoppingBag,
    Tag,
    User,
} from "lucide-react";
import Image from "next/image";
import { memo, useMemo } from "react";

interface ProductDetailDialogProps {
    product: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Memoized image component to prevent unnecessary re-renders
const CostumeImage = memo(({ src, alt, sizes }: { src: string; alt: string; sizes: string }) => (
    <Image src={src} alt={alt} fill className="object-contain" sizes={sizes} priority={false} />
));
CostumeImage.displayName = "CostumeImage";

// Memoized placeholder component
const ImagePlaceholder = memo(({ text }: { text: string }) => (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
        {text}
    </div>
));
ImagePlaceholder.displayName = "ImagePlaceholder";

const ProductDetailDialog = memo(({ product, open, onOpenChange }: ProductDetailDialogProps) => {
    // Early return if not open or no product
    if (!open || !product) return null;

    // Memoized status variant
    const statusVariant = useMemo(() => {
        switch (product.status) {
            case "active":
                return "default";
            case "inactive":
                return "destructive";
            case "rented":
                return "secondary";
            case "maintenance":
                return "destructive";
            default:
                return "outline";
        }
    }, [product.status]);

    // Memoized listing type badges
    const listingTypeBadges = useMemo(() => {
        const badges = [];
        if (product.listing_type === "rent" || product.listing_type === "both") {
            badges.push(
                <Badge key="rent" variant="secondary" className="mr-2">
                    Rent
                </Badge>
            );
        }
        if (product.listing_type === "sale" || product.listing_type === "both") {
            badges.push(
                <Badge key="sale" variant="secondary">
                    Sale
                </Badge>
            );
        }
        return badges;
    }, [product.listing_type]);

    // Memoized dates
    const formattedDates = useMemo(
        () => ({
            created: product.created_at
                ? new Date(product.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : "N/A",
            updated: product.updated_at
                ? new Date(product.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : "N/A",
        }),
        [product.created_at, product.updated_at]
    );

    // Memoized additional images
    const sortedAdditionalImages = useMemo(() => {
        if (!product.additional_images?.length) return [];
        return [...product.additional_images]
            .filter((img: any) => img.url)
            .sort((a: any, b: any) => a.order - b.order);
    }, [product.additional_images]);

    const handleClose = () => {
        onOpenChange(false)
        window.location.reload()
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-5xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
                        <Package className="h-5 w-5 text-primary" />
                        Costume Details
                    </DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm md:text-base text-muted-foreground">
                        <span>Complete information about {product.name}</span>
                        <div className="flex items-center gap-2">{listingTypeBadges}</div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    {/* DETAILS TAB */}
                    <TabsContent value="details" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Main Image */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="relative h-56 md:h-80 w-full rounded-lg overflow-hidden bg-black">
                                        {product.main_images?.front ? (
                                            <CostumeImage
                                                src={product.main_images.front}
                                                alt={product.name}
                                                sizes="(max-width: 640px) 95vw, 600px"
                                            />
                                        ) : (
                                            <ImagePlaceholder text="No image available" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Info className="h-4 w-4" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoField icon={Tag} label="Name" value={product.name} />
                                    <InfoField icon={ShoppingBag} label="Brand" value={product.brand} />
                                    <InfoField
                                        icon={Package}
                                        label="Category"
                                        value={<Badge variant="outline">{product.category}</Badge>}
                                    />
                                    <InfoField
                                        icon={User}
                                        label="Gender"
                                        value={
                                            <Badge variant="secondary" className="capitalize">
                                                {product.gender}
                                            </Badge>
                                        }
                                    />
                                    <InfoField icon={Ruler} label="Sizes" value={product.sizes || "N/A"} />
                                    <InfoField
                                        icon={Package}
                                        label="Status"
                                        value={
                                            <Badge variant={statusVariant} className="capitalize">
                                                {product.status}
                                            </Badge>
                                        }
                                    />
                                    <div className="sm:col-span-2 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                            Description
                                        </div>
                                        <p className="text-sm break-words">{product.description || "No description available"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <Clock className="h-4 w-4" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <InfoField
                                    icon={Package}
                                    label="Availability"
                                    value={
                                        <Badge variant={product.is_available ? "default" : "destructive"}>
                                            {product.is_available ? "Available" : "Unavailable"}
                                        </Badge>
                                    }
                                />
                                <InfoField
                                    icon={Package}
                                    label="Selected Type"
                                    value={product.selected_costume_type || "None"}
                                />
                                <InfoField
                                    icon={ShieldAlert}
                                    label="Security Deposit"
                                    value={`₱${product.security_deposit || "0"}`}
                                />
                                <InfoField icon={Calendar} label="Extended Days" value={`${product.extended_days || "0"} days`} />
                                <InfoField icon={Calendar} label="Created" value={formattedDates.created} />
                                <InfoField icon={Clock} label="Last Updated" value={formattedDates.updated} />
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Tag className="h-4 w-4" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag: string, index: number) => (
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
                    <TabsContent value="images" className="space-y-4 pt-4">
                        {/* Main Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <Package className="h-4 w-4" />
                                    Main Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ImageView
                                        label="Front View"
                                        src={product.main_images?.front}
                                        alt={`${product.name} - Front View`}
                                        placeholder="No front image"
                                    />
                                    <ImageView
                                        label="Back View"
                                        src={product.main_images?.back}
                                        alt={`${product.name} - Back View`}
                                        placeholder="No back image"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Images */}
                        {sortedAdditionalImages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Package className="h-4 w-4" />
                                        Additional Images ({sortedAdditionalImages.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {sortedAdditionalImages.map((img: any, idx: number) => (
                                            <div key={idx} className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Image {idx + 1}</p>
                                                <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                                    <CostumeImage
                                                        src={img.url}
                                                        alt={`Additional image ${idx + 1}`}
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <div className="flex justify-end">
                    <Button onClick={handleClose} variant="outline" className="w-full md:w-auto">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
});

ProductDetailDialog.displayName = "ProductDetailDialog";

// Helper components
const InfoField = memo(
    ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            {typeof value === "string" ? <p className="font-medium break-words">{value}</p> : value}
        </div>
    )
);
InfoField.displayName = "InfoField";

const ImageView = memo(
    ({ label, src, alt, placeholder }: { label: string; src?: string; alt: string; placeholder: string }) => (
        <div className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                {src ? (
                    <CostumeImage src={src} alt={alt} sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                    <ImagePlaceholder text={placeholder} />
                )}
            </div>
        </div>
    )
);
ImageView.displayName = "ImageView";

export default ProductDetailDialog; 