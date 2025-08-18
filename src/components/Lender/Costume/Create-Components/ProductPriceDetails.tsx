import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormValues } from '@/lib/zodFormSchema/productSchema';
import { AlertCircle } from 'lucide-react';
import { memo, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ProductPriceDetailsProps {
    form: UseFormReturn<ProductFormValues>;
}

const ProductPriceDetails = memo(({ form }: ProductPriceDetailsProps) => {
    const {
        register,
        watch,
        formState: { errors, touchedFields }
    } = form;

    // Watch form values
    const productType = watch('productType');
    const discount = watch('discount');

    // Get the regular price from the first productType (or selectedProductType if you want to support that)
    const regularPrice = productType && productType.length > 0 ? productType[0]?.price : '';

    // Calculate sale price using useMemo to prevent unnecessary recalculations
    const salePrice = useMemo(() => {
        if (!regularPrice) return 0;
        const regular = parseFloat(regularPrice);
        const discountPercent = discount ? parseFloat(discount) : 0;
        if (isNaN(regular) || isNaN(discountPercent)) return 0;
        return regular - (regular * (discountPercent / 100));
    }, [regularPrice, discount]);

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="productType-0-price" className="flex items-center">
                            Regular Price (₱)*
                            {touchedFields.productType && errors.productType && (
                                <span className="ml-1 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                            )}
                        </Label>
                        <Input
                            id="productType-0-price"
                            type="number"
                            placeholder="100"
                            min="0"
                            step="0.01"
                            {...register('productType.0.price')}
                            className={touchedFields.productType && errors.productType ? "border-red-500" : ""}
                        />
                        {touchedFields.productType && errors.productType && (
                            <p className="text-xs text-red-500">{
                                typeof errors.productType === 'object' &&
                                    Array.isArray(errors.productType) &&
                                    errors.productType[0]?.price?.message
                                    ? errors.productType[0].price.message
                                    : typeof errors.productType === 'string'
                                        ? errors.productType
                                        : null
                            }</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-discount" className="flex items-center">
                            Discount (%)
                            {touchedFields.discount && errors.discount?.message && (
                                <span className="ml-1 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                            )}
                        </Label>
                        <Input
                            id="product-discount"
                            type="number"
                            placeholder="30"
                            min="0"
                            max="100"
                            {...register('discount')}
                            className={touchedFields.discount && errors.discount ? "border-red-500" : ""}
                        />
                        {touchedFields.discount && errors.discount?.message && (
                            <p className="text-xs text-red-500">{errors.discount.message}</p>
                        )}
                    </div>
                </div>

                {regularPrice && parseFloat(regularPrice) > 0 && (
                    <div className="mt-4 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Sale Price:</span>
                            <span className="text-lg font-semibold text-rose-600">₱{salePrice.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

ProductPriceDetails.displayName = 'ProductPriceDetails';

export default ProductPriceDetails; 