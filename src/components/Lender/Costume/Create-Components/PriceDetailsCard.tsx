import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductType } from "@/lib/zodFormSchema/productSchema";
import { formatOfferType } from '@/lib/utils';

// --- Rent Price Details Card ---
export const RentPriceDetailsCard = memo(() => {
    const { formState: { errors, touchedFields }, watch, setValue, control } = useFormContext();
    const securityDeposit = watch('security_deposit') || '';
    const extendedDays = watch('extended_days') || '';
    // Removed rentalPrice
    const productTypes = watch('productType') || [];
    const selectedType = watch('selectedProductType');

    // Calculate base price for rent
    const basePrice = useMemo(() => {
        if (!selectedType && productTypes.length > 0) {
            const firstType = productTypes[0];
            return firstType && firstType.price ? parseFloat(firstType.price) || 0 : 0;
        }
        if (!selectedType || !productTypes.length) return 0;
        const type = productTypes.find((type: ProductType) => type.type === selectedType);
        const price = type ? parseFloat(type.price) : 0;
        return isNaN(price) ? 0 : price;
    }, [selectedType, productTypes]);

    // Auto-select first product type on mount if none selected
    useMemo(() => {
        if (!selectedType && productTypes.length > 0) {
            setValue('selectedProductType', productTypes[0].type);
        }
    }, [productTypes, selectedType, setValue]);

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Rent Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* Product Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="selected-product-type">Select Costume Type</Label>
                        <Controller
                            name="selectedProductType"
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || (productTypes.length > 0 ? productTypes[0].type : '')}
                                >
                                    <SelectTrigger id="selected-product-type">
                                        <SelectValue placeholder="Select a costume type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productTypes.map((type: ProductType, index: number) => (
                                            <SelectItem
                                                key={`rent-price-details-${index}-${type.type}`}
                                                value={type.type}
                                            >
                                                {formatOfferType(type.type)} - ₱{parseFloat(type.price || '0').toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-xs text-gray-500">
                            Select the costume type you want to rent. The main offer is automatically selected as default.
                        </p>
                    </div>
                </div>
                {/* Price Display */}
                {productTypes.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Base Rent Price:</span>
                            <span className="text-lg font-semibold">₱{basePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Security Deposit:</span>
                                <Controller
                                    name="security_deposit"
                                    render={({ field }) => (
                                        <Input
                                            id="security_deposit"
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            {...field}
                                            className={touchedFields.security_deposit && errors.security_deposit ? "border-red-500" : ""}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Extended Days (per day):</span>
                                <Controller
                                    name="extended_days"
                                    render={({ field }) => (
                                        <Input
                                            id="extended_days"
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            {...field}
                                            className={touchedFields.extended_days && errors.extended_days ? "border-red-500" : ""}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {productTypes.length === 0 && (
                    <div className="mt-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                        <p className="text-sm text-yellow-800">
                            Please add at least one costume type with pricing to see rent price details.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
RentPriceDetailsCard.displayName = 'RentPriceDetailsCard';

// --- Sale Price Details Card ---
export const SalePriceDetailsCard = memo(() => {
    const { formState: { errors, touchedFields }, watch, control } = useFormContext();
    const salePrice = watch('sale_price') || '';
    const discount = watch('discount') || '';

    // Calculate sale price
    const basePrice = salePrice ? parseFloat(salePrice) || 0 : 0;
    const calculatedSalePrice = useMemo(() => {
        if (basePrice <= 0) return 0;
        const discountPercent = discount ? parseFloat(discount) : 0;
        if (isNaN(discountPercent) || discountPercent <= 0) return basePrice;
        return basePrice - (basePrice * (discountPercent / 100));
    }, [basePrice, discount]);

    const discountError = useMemo(() => ({
        hasError: touchedFields.discount && errors.discount?.message,
        message: errors.discount?.message
    }), [touchedFields.discount, errors.discount]);

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Sale Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* Sale Price Input */}
                    <div className="space-y-2">
                        <Label htmlFor="sale_price" className="flex items-center">
                            Sale Price (₱)*
                            {touchedFields.sale_price && errors.sale_price && (
                                <span className="ml-1 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                            )}
                        </Label>
                        <Controller
                            name="sale_price"
                            control={control}
                            rules={{ required: 'Sale price is required' }}
                            render={({ field }) => (
                                <Input
                                    id="sale_price"
                                    type="number"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    className={touchedFields.sale_price && errors.sale_price ? "border-red-500" : ""}
                                />
                            )}
                        />
                        {touchedFields.sale_price && errors.sale_price && (
                            typeof errors.sale_price.message === 'string' ? (
                                <p className="text-xs text-red-500">{errors.sale_price.message}</p>
                            ) : null
                        )}
                    </div>
                    {/* Discount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="product-discount" className="flex items-center">
                            Discount (%)
                            {discountError.hasError && (
                                <span className="ml-1 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                            )}
                        </Label>
                        <Controller
                            name="discount"
                            render={({ field }) => (
                                <Input
                                    id="product-discount"
                                    type="number"
                                    placeholder="30"
                                    min="0"
                                    max="100"
                                    {...field}
                                    className={discountError.hasError ? "border-red-500" : ""}
                                />
                            )}
                        />
                        {discountError.hasError && (
                            <p className="text-xs text-red-500">{discountError.message as string}</p>
                        )}
                    </div>
                </div>
                {/* Price Display */}
                <div className="mt-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Base Price:</span>
                        <span className="text-lg font-semibold">₱{basePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {discount && parseFloat(discount) > 0 && (
                        <>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Discount ({discount}%):</span>
                                <span className="text-sm text-gray-600">-₱{(basePrice * (parseFloat(discount) / 100)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <span className="text-sm font-medium">Sale Price:</span>
                                <span className="text-lg font-semibold text-rose-600">₱{calculatedSalePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </>
                    )}
                    {(!discount || parseFloat(discount) <= 0) && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium">Final Price:</span>
                            <span className="text-lg font-semibold text-green-600">₱{basePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
SalePriceDetailsCard.displayName = 'SalePriceDetailsCard';

// --- Wrapper for backward compatibility ---
const PriceDetailsCard = memo(({ salePrice }: { salePrice: number }) => {
    const { watch } = useFormContext();
    const listingType = watch('listingType');
    // Render based on listingType
    if (listingType === 'rent') return <RentPriceDetailsCard />;
    if (listingType === 'sale') return <SalePriceDetailsCard />;
    if (listingType === 'both') return (
        <div className="space-y-6">
            <RentPriceDetailsCard />
            <SalePriceDetailsCard />
        </div>
    );
    // fallback
    return null;
});
PriceDetailsCard.displayName = 'PriceDetailsCard';

export default PriceDetailsCard;
