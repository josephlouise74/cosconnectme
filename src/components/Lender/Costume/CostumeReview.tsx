import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Calendar, Shield, ShoppingBag, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import React, { memo } from 'react';

interface ProductPreviewProps {
    formData: any;
    mainImages: {
        front: File | null;
        back: File | null;
    };
    existingImages?: {
        front?: string;
        back?: string;
        additional?: { id: string; url: string }[];
    } | null;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
    formData,
    mainImages,
    existingImages,
}) => {
    const selectedType = formData.productType?.find((type: any) => type.type && type.price);
    const basePrice = selectedType ? parseFloat(selectedType.price) : 0;
    const discountAmount = formData.discount ? parseFloat(formData.discount) : 0;
    const salePrice = basePrice && discountAmount > 0
        ? basePrice * (1 - discountAmount / 100)
        : basePrice;

    const hasDiscount = discountAmount > 0;
    const isRentOnly = formData.listingType === 'rent';
    const isSaleOnly = formData.listingType === 'sale';
    const isBoth = formData.listingType === 'both';
    const canHaveAddOns = isSaleOnly || isBoth;

    // Get display image
    const displayImage = mainImages.front || (existingImages?.front ? existingImages.front : null);

    const renderPriceSection = () => {
        if (basePrice <= 0) return null;

        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Listing type indicators */}
                    <div className="flex items-center gap-1 text-xs">
                        {isRentOnly && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Calendar className="w-3 h-3 mr-1" />
                                Rent Only
                            </Badge>
                        )}
                        {isSaleOnly && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                Sale Only
                            </Badge>
                        )}
                        {isBoth && (
                            <>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Rent
                                </Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                    Sale
                                </Badge>
                            </>
                        )}
                    </div>
                </div>

                {/* Price display */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-lg ${hasDiscount ? 'text-gray-500 line-through' : 'text-gray-900 font-bold'}`}>
                        ₱{basePrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    {hasDiscount && (
                        <Badge variant="destructive" className="bg-rose-500">
                            {discountAmount}% OFF
                        </Badge>
                    )}
                </div>

                {hasDiscount && (
                    <span className="text-2xl font-bold text-rose-600">
                        ₱{salePrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                )}

                {/* Rental specific pricing */}
                {(isRentOnly || isBoth) && formData.security_deposit && (
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                        <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Security Deposit: ₱{parseFloat(formData.security_deposit).toLocaleString('en-PH')}</span>
                        </div>
                        {formData.extended_days && (
                            <div>Extended Days: ₱{parseFloat(formData.extended_days).toLocaleString('en-PH')}/day</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderProductDetails = () => {
        const details = [
            { label: 'Gender', value: formData.gender || 'Not specified' },
            { label: 'Category', value: formData.category || 'Not specified' },
            { label: 'Sizes', value: formData.sizes || 'Not specified' },
        ];

        return (
            <div className="grid grid-cols-1 gap-y-2 text-sm">
                {details.map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{label}:</span>
                        <span className="capitalize font-medium text-right flex-1 ml-2">{value}</span>
                    </div>
                ))}
                {selectedType && (
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Type:</span>
                        <span className="capitalize font-medium">
                            {selectedType.type.replace('_', ' ')}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="shadow-md">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Image Preview */}
                    <div className="aspect-square rounded-lg shadow-sm flex items-center justify-center border overflow-hidden bg-gray-50">
                        {displayImage ? (
                            typeof displayImage === 'string' ? (
                                <Image
                                    src={displayImage}
                                    alt="Costume Preview"
                                    className="max-w-full h-auto object-contain rounded-lg"
                                    width={500}
                                    height={500}
                                />
                            ) : (
                                <Image
                                    src={URL.createObjectURL(displayImage)}
                                    alt="Costume Preview"
                                    className="max-w-full h-auto object-contain rounded-lg"
                                    width={500}
                                    height={500}
                                />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <UploadCloud className="h-16 w-16 mb-2" />
                                <span className="text-center">Costume Image Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                            {formData.name || 'Cosplay Costume Name'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-3">
                            {formData.brand ? `By ${formData.brand}` : 'Brand Name'}
                        </p>
                        {renderPriceSection()}
                    </div>

                    {/* Tags Preview */}
                    {formData.tags && formData.tags.length > 0 && (
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium mb-3">Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag: string) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="bg-rose-50 text-rose-700 border-rose-200 text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {formData.description && (
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-2">Description:</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {formData.description.length > 150
                                    ? `${formData.description.substring(0, 150)}...`
                                    : formData.description}
                            </p>
                        </div>
                    )}

                    {/* Product Details */}
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Product Details:</h3>
                        {renderProductDetails()}
                    </div>

                    {/* Add-ons Section - Only for Sale Costumes */}
                    {canHaveAddOns && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-sm font-medium">Add-ons:</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {isSaleOnly ? 'Sale Only' : 'Sale Features'}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Rental-only notice */}
                    {isRentOnly && (
                        <div className="pt-4 border-t">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Rental Only</span>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                    This costume is available for rental only. Add-ons are not available for rental costumes.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

ProductPreview.displayName = 'ProductPreview';

export default memo(ProductPreview);