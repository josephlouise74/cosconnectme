import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { AlertCircle } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TagSelector from './ProductTagSelector';
import { CostumeFormValues } from '@/lib/zodSchema/costumeSchema';
import { useFetchAllCategories } from '@/lib/api/categoryApi';
import { SIZE_OPTIONS } from '@/lib/types/costume';
import { useGetAllTags } from '@/lib/api/tagsApi';

interface ProductInformationFormSectionProps {
    handleAddTag: (tag: string) => void;
    handleRemoveTag: (tag: string) => void;
}

// Memoized sub-components to prevent unnecessary re-renders
const FormField = memo<{
    label: string;
    name: keyof CostumeFormValues;
    placeholder: string;
    type?: 'text' | 'textarea';
    rows?: number;
    required?: boolean;
    errors: any;
    touchedFields: any;
}>(({ label, name, placeholder, type = 'text', rows = 4, required = true, errors, touchedFields }) => {
    const { control } = useFormContext<CostumeFormValues>();
    const hasError = touchedFields[name] && errors[name];

    return (
        <div className="space-y-2">
            <Label htmlFor={`product-${name}`} className="flex items-center">
                {label}{required && '*'}
                {hasError && (
                    <span className="ml-1 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                    </span>
                )}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <>
                        {type === 'textarea' ? (
                            <Textarea
                                id={`product-${name}`}
                                placeholder={placeholder}
                                rows={rows}
                                {...field as any}
                                className={hasError ? "border-red-500" : ""}
                            />
                        ) : (
                            <Input
                                id={`product-${name}`}
                                placeholder={placeholder}
                                {...field as any}
                                className={hasError ? "border-red-500" : ""}
                            />
                        )}
                    </>
                )}
            />
            {hasError && (
                <p className="text-xs text-red-500">{errors[name]?.message}</p>
            )}
        </div>
    );
});

const GenderSelect = memo<{
    errors: any;
    touchedFields: any;
}>(({ errors, touchedFields }) => {
    const { setValue } = useFormContext<CostumeFormValues>();

    const handleGenderChange = useCallback((value: "male" | "female" | "unisex") => {
        setValue('gender', value, { shouldValidate: true });
    }, [setValue]);

    return (
        <div className="space-y-2">
            <Label htmlFor="gender">Gender*</Label>
            <Select onValueChange={handleGenderChange} defaultValue="unisex">
                <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
            </Select>
            {touchedFields.gender && errors.gender?.message && (
                <p className="text-xs text-red-500">{errors.gender.message}</p>
            )}
        </div>
    );
});

const CategorySelect = memo<{
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    errors: any;
    touchedFields: any;
}>(({ selectedCategory, onCategoryChange, errors, touchedFields }) => {
    // Fetch categories from API
    const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchAllCategories({
        page: 1,
        limit: 100,
    });

    // Memoize categories to prevent recalculation
    const categories = useMemo(() => {
        if (!categoriesData?.data?.categories) return [];
        return categoriesData.data.categories.map(category => ({
            value: category.categoryName,
            label: category.categoryName
        }));
    }, [categoriesData]);

    const categoryLabel = useMemo(() => {
        if (!selectedCategory) return null;
        return categories.find(c => c.value === selectedCategory)?.label;
    }, [selectedCategory, categories]);

    return (
        <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select onValueChange={onCategoryChange} value={selectedCategory}>
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
                <div className="text-sm mt-1 text-gray-600">{categoryLabel}</div>
            )}
            {touchedFields.category && errors.category?.message && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
        </div>
    );
});

const ListingTypeSelect = memo<{
    errors: any;
    touchedFields: any;
}>(({ errors, touchedFields }) => {
    const { control } = useFormContext<CostumeFormValues>();

    return (
        <div className="space-y-2">
            <Label htmlFor="listingType">Listing Type*</Label>
            <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="listingType" className="w-full">
                            <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                        <SelectContent className='w-full'>
                            <SelectItem value="rent">Rent</SelectItem>
                            {/*  <SelectItem value="sale">Sale</SelectItem> */}
                        </SelectContent>
                    </Select>
                )}
            />
            {touchedFields.listingType && errors.listingType?.message && (
                <p className="text-xs text-red-500">{errors.listingType.message}</p>
            )}
        </div>
    );
});

const SizeSelector = memo<{
    selectedSizes: string;
    onSizeChange: (size: string) => void;
    errors: any;
    touchedFields: any;
}>(({ selectedSizes, onSizeChange, errors, touchedFields }) => {
    const handleSizeClick = useCallback((size: string) => {
        onSizeChange(selectedSizes === size ? '' : size);
    }, [selectedSizes, onSizeChange]);

    return (
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
                        onClick={() => handleSizeClick(size.value)}
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
    );
});

const TagsSection = memo<{
    tags: string[];
    handleAddTag: (tag: string) => void;
    handleRemoveTag: (tag: string) => void;
    errors: any;
    touchedFields: any;
}>(({ tags, handleAddTag, handleRemoveTag, errors, touchedFields }) => {
    // Fetch tags from API with pagination
    const { tags: availableTags, isLoading: isTagsLoading } = useGetAllTags({
        page: 1,
        limit: 100,
    });

    const availableTagNames = useMemo(() =>
        availableTags.map(tag => tag.tagName),
        [availableTags]
    );

    return (
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
                availableTags={availableTagNames}
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
    );
});

// Set display names for debugging
FormField.displayName = 'FormField';
GenderSelect.displayName = 'GenderSelect';
CategorySelect.displayName = 'CategorySelect';
ListingTypeSelect.displayName = 'ListingTypeSelect';
SizeSelector.displayName = 'SizeSelector';
TagsSection.displayName = 'TagsSection';

const ProductInformationFormSection: React.FC<ProductInformationFormSectionProps> = memo(({
    handleAddTag,
    handleRemoveTag,
}) => {
    const {
        formState: { errors, touchedFields },
        watch,
        setValue
    } = useFormContext<CostumeFormValues>();

    // Watch only the specific values we need
    const watchedValues = watch(['tags', 'category', 'sizes']);
    const [tags, selectedCategory, selectedSizes] = watchedValues;

    // Memoized handlers to prevent unnecessary re-renders
    const handleCategoryChange = useCallback((value: string) => {
        setValue('category', value, { shouldValidate: true });
    }, [setValue]);

    const handleSizeChange = useCallback((size: string) => {
        setValue('sizes', size, { shouldValidate: true });
    }, [setValue]);

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Costume Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Costume Name */}
                    <FormField
                        label="Costume Name"
                        name="name"
                        placeholder="Enter costume name"
                        errors={errors}
                        touchedFields={touchedFields}
                    />

                    {/* Brand Name */}
                    <FormField
                        label="Brand Name"
                        name="brand"
                        placeholder="Enter brand name"
                        errors={errors}
                        touchedFields={touchedFields}
                    />

                    {/* Gender */}
                    <GenderSelect
                        errors={errors}
                        touchedFields={touchedFields}
                    />

                    {/* Category */}
                    <CategorySelect
                        selectedCategory={selectedCategory || ''}
                        onCategoryChange={handleCategoryChange}
                        errors={errors}
                        touchedFields={touchedFields}
                    />

                    {/* Listing Type */}
                    <ListingTypeSelect
                        errors={errors}
                        touchedFields={touchedFields}
                    />
                </div>

                {/* Size Selection */}
                <SizeSelector
                    selectedSizes={selectedSizes || ''}
                    onSizeChange={handleSizeChange}
                    errors={errors}
                    touchedFields={touchedFields}
                />

                {/* Description */}
                <FormField
                    label="Description"
                    name="description"
                    placeholder="Enter costume description"
                    type="textarea"
                    rows={4}
                    errors={errors}
                    touchedFields={touchedFields}
                />

                {/* Tags */}
                <TagsSection
                    tags={tags || []}
                    handleAddTag={handleAddTag}
                    handleRemoveTag={handleRemoveTag}
                    errors={errors}
                    touchedFields={touchedFields}
                />
            </CardContent>
        </Card>
    );
});

ProductInformationFormSection.displayName = "ProductInformationFormSection";

export default ProductInformationFormSection;