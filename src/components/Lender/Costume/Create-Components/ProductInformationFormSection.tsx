import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFetchAllCategories } from '@/lib/apis/categoryApi';
import { useGetAllTags } from '@/lib/apis/tagsApi';
import { ProductFormValues } from '@/lib/zodFormSchema/productSchema';

import { AlertCircle } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TagSelector from './ProductTagSelector';
import { ProductTypesSection } from './ProductTypesSection';
import { SIZE_OPTIONS } from '@/types/LenderTypeV2';

interface ProductInformationFormSectionProps {
    handleAddTag: (tag: string) => void;
    handleRemoveTag: (tag: string) => void;
}

const ProductInformationFormSection: React.FC<ProductInformationFormSectionProps> = memo(({
    handleAddTag,
    handleRemoveTag,
}) => {
    const { control, formState: { errors, touchedFields }, watch, setValue } = useFormContext<ProductFormValues>();
    const tags = watch('tags') || [];
    const selectedCategory = watch('category');
    const selectedSizes = watch('sizes') || '';

    // Fetch tags from API with pagination
    const { tags: availableTags, isLoading: isTagsLoading } = useGetAllTags({
        page: 1,
        limit: 100,
    });

    // Fetch categories from API
    const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchAllCategories({
        page: 1,
        limit: 100,
    });

    // Memoize categories
    const categories = useMemo(() => {
        if (!categoriesData?.data?.categories) return [];
        return categoriesData.data.categories.map(category => ({
            value: category.categoryName,
            label: category.categoryName
        }));
    }, [categoriesData]);

    const addProductType = useCallback(() => {
        const currentTypes = watch('productType') || [];
        setValue('productType', [...currentTypes, { type: '', price: '' }], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    }, [watch, setValue]);

    const removeProductType = useCallback((index: number) => {
        const currentTypes = watch('productType') || [];
        setValue('productType', currentTypes.filter((_, i) => i !== index), {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    }, [watch, setValue]);

    // Memoize the category label
    const categoryLabel = useMemo(() => {
        if (!selectedCategory) return null;
        return categories.find(c => c.value === selectedCategory)?.label;
    }, [selectedCategory, categories]);

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Costume Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Costume Name */}
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <Label htmlFor="product-name" className="flex items-center">
                                    Costume Name*
                                    {touchedFields.name && errors.name?.message && (
                                        <span className="ml-1 text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="product-name"
                                    placeholder="Enter costume name"
                                    {...field}
                                    className={touchedFields.name && errors.name ? "border-red-500" : ""}
                                />
                                {touchedFields.name && errors.name?.message && (
                                    <p className="text-xs text-red-500">{errors.name.message}</p>
                                )}
                            </div>
                        )}
                    />

                    {/* Brand Name */}
                    <Controller
                        name="brand"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <Label htmlFor="product-brand" className="flex items-center">
                                    Brand Name*
                                    {touchedFields.brand && errors.brand?.message && (
                                        <span className="ml-1 text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="product-brand"
                                    placeholder="Enter brand name"
                                    {...field}
                                    className={touchedFields.brand && errors.brand ? "border-red-500" : ""}
                                />
                                {touchedFields.brand && errors.brand?.message && (
                                    <p className="text-xs text-red-500">{errors.brand.message}</p>
                                )}
                            </div>
                        )}
                    />

                    {/* Product Types Section */}
                    <ProductTypesSection
                        control={control}
                        errors={errors}
                        touchedFields={touchedFields}
                        onRemove={removeProductType}
                        onAdd={addProductType}
                    />

                    {/* Gender */}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender*</Label>
                        <Select
                            onValueChange={(value: "male" | "female" | "unisex") => setValue('gender', value)}
                            defaultValue="unisex"
                        >
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="unisex">Unisex</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category*</Label>
                        <Select
                            onValueChange={(value) => setValue('category', value)}
                            value={selectedCategory}
                        >
                            <SelectTrigger id="category" className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className='w-full'>
                                {isCategoriesLoading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading categories...
                                    </SelectItem>
                                ) : categories.length === 0 ? (
                                    <SelectItem value="no-categories" disabled>
                                        No categories available
                                    </SelectItem>
                                ) : (
                                    categories.map((category) => (
                                        <SelectItem
                                            key={category.value}
                                            value={category.value}
                                            className='capitalize'
                                        >
                                            {category.label}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {categoryLabel && (
                            <div className="text-sm mt-1">{categoryLabel}</div>
                        )}
                        {touchedFields.category && errors.category?.message && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Listing Type (Rent/Sale/Both) */}
                    <div className="space-y-2">
                        <Label htmlFor="listingType">Listing Type*</Label>
                        <Controller
                            name="listingType"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger id="listingType" className="w-full">
                                        <SelectValue placeholder="Select listing type" />
                                    </SelectTrigger>
                                    <SelectContent className='w-full'>
                                        <SelectItem value="rent">Rent</SelectItem>
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {touchedFields.listingType && errors.listingType?.message && (
                            <p className="text-xs text-red-500">{errors.listingType.message}</p>
                        )}
                    </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                    <Label className="flex items-center">
                        Available Size*
                        {touchedFields.sizes && errors.sizes?.message && (
                            <span className="ml-1 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                            </span>
                        )}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {SIZE_OPTIONS.map((size) => (
                            <button
                                key={size.id}
                                type="button"
                                onClick={() => setValue('sizes', selectedSizes === size.value ? '' : size.value, { shouldValidate: true })}
                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${selectedSizes === size.value
                                    ? 'bg-rose-500 text-white border-rose-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'
                                    }`}
                            >
                                {size.value}
                            </button>
                        ))}
                    </div>
                    {selectedSizes && (
                        <p className="text-xs text-gray-500">
                            Selected: {selectedSizes}
                        </p>
                    )}
                    {touchedFields.sizes && errors.sizes?.message && (
                        <p className="text-xs text-red-500">{errors.sizes.message}</p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="product-description" className="flex items-center">
                        Description*
                        {touchedFields.description && errors.description?.message && (
                            <span className="ml-1 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                            </span>
                        )}
                    </Label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                id="product-description"
                                placeholder="Enter costume description"
                                rows={4}
                                {...field}
                                className={touchedFields.description && errors.description ? "border-red-500" : ""}
                            />
                        )}
                    />
                    {touchedFields.description && errors.description?.message && (
                        <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <Label htmlFor="product-tags" className="flex items-center">
                        Tags*
                        {touchedFields.tags && errors.tags?.message && (
                            <span className="ml-1 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                            </span>
                        )}
                    </Label>
                    <TagSelector
                        availableTags={availableTags.map(tag => tag.tagName)}
                        selectedTags={tags}
                        onTagSelect={handleAddTag}
                        onTagRemove={handleRemoveTag}
                        isLoading={isTagsLoading as any}
                    />
                    {touchedFields.tags && errors.tags?.message && (
                        <p className="text-xs text-red-500">{errors.tags.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Add tags related to your costume (e.g., anime name, character, style)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

ProductInformationFormSection.displayName = "ProductInformationFormSection";

export default ProductInformationFormSection;