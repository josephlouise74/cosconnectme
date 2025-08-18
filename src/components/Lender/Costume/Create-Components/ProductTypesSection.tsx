import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormValues } from '@/lib/zodFormSchema/productSchema';
import { PRODUCT_TYPES } from '@/types/CostumeDataType';
import { formatOfferType } from '@/lib/utils';

import { AlertCircle, Star, X } from 'lucide-react';
import { memo, useEffect } from 'react';
import { Control, Controller, FieldErrors, useFormContext } from 'react-hook-form';

// Memoized Product Type Item Component
const ProductTypeItem = memo(({
    index,
    control,
    onRemove,
    isFirst
}: {
    index: number;
    control: Control<ProductFormValues>;
    onRemove: (index: number) => void;
    isFirst: boolean;
}) => {
    const { setValue, watch } = useFormContext();
    const productTypes = watch('productType') || [];

    // Set initial values when component mounts
    useEffect(() => {
        if (isFirst && productTypes[index]?.type) {
            setValue('selectedProductType', productTypes[index].type);
        }
    }, [isFirst, index, productTypes, setValue]);

    return (
        <div className="flex gap-4 items-start">
            <div className="flex-1">
                <Controller
                    name={`productType.${index}.type`}
                    control={control}
                    render={({ field }) => (
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                if (isFirst) {
                                    setValue('selectedProductType', value);
                                }
                            }}
                            value={field.value}
                        >
                            <SelectTrigger id={`product-type-${index}`} className="w-full">
                                <SelectValue placeholder="Select costume type" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                {PRODUCT_TYPES.filter(type => type.value !== '').map((type, typeIndex) => (
                                    <SelectItem
                                        key={`${index}-${typeIndex}-${type.value}`}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            <div className="flex-1">
                <Controller
                    name={`productType.${index}.price`}
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="number"
                            placeholder="Price"
                            value={field.value}
                            onChange={(e) => {
                                field.onChange(e.target.value);
                            }}
                            className="w-full"
                        />
                    )}
                />
            </div>
            {!isFirst && (
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="mt-1"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
});

ProductTypeItem.displayName = 'ProductTypeItem';

interface ProductTypesSectionProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    touchedFields: any;
    onRemove: (index: number) => void;
    onAdd: () => void;
}

// Memoized Product Types Section
export const ProductTypesSection = memo(({
    control,
    errors,
    touchedFields,
    onRemove,
    onAdd
}: ProductTypesSectionProps) => {
    const { setValue, watch } = useFormContext();
    const productTypes = watch('productType') || [];

    const handleAdd = () => {
        onAdd();
        const newIndex = productTypes.length;
        // Use a unique type value for each new product type
        const uniqueType = `${PRODUCT_TYPES[2]?.value || "costume_only"}_${Date.now()}`;
        setValue(`productType.${newIndex}.type`, uniqueType);
        setValue(`productType.${newIndex}.price`, '');
    };

    return (
        <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
                <Label className="flex items-center">
                    Costume Types and Prices*
                    {touchedFields.productType && errors.productType?.message && (
                        <span className="ml-1 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                        </span>
                    )}
                </Label>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>Main Offer</span>
                </div>
            </div>
            <Controller
                name="productType"
                control={control}
                render={({ field }) => (
                    <div className="space-y-4">
                        {field.value?.map((item, index: number) => (
                            <div key={`product-type-${index}-${item.type}`} className="relative">
                                {index === 0 && (
                                    <div className="absolute -top-2 -left-2">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                )}
                                <ProductTypeItem
                                    index={index}
                                    control={control}
                                    onRemove={onRemove}
                                    isFirst={index === 0}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAdd}
                            className="w-full"
                        >
                            Add Another Costume Type
                        </Button>
                    </div>
                )}
            />
            {touchedFields.productType && errors.productType?.message && (
                <p className="text-xs text-red-500">{errors.productType.message}</p>
            )}
            <div className="space-y-2">
                <p className="text-xs text-gray-500">
                    Set up your costume types and prices. The first type will be your main offer (marked with a star).
                </p>
                <p className="text-xs text-gray-500">
                    Additional types are optional and allow borrowers to choose different rental options.
                </p>
            </div>
        </div>
    );
});

ProductTypesSection.displayName = 'ProductTypesSection'; 