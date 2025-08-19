// ProductAddOnsFormSection.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CostumeFormValues } from '@/lib/zodFormSchema/productSchema';
import { Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import React, { memo, useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

// Type for a single add-on/feature
export type ProductAddOn = {
    id: string;
    name: string;
    description: string;
    price: string;
    image: File | null;
};

// Props for the component
interface ProductAddOnsFormSectionProps {
    className?: string;
    product?: {
        addOns?: {
            id: string;
            name: string;
            description: string;
            price: string;
            image?: any;
        }[];
    } | undefined;
}

const ProductAddOnsFormSection: React.FC<ProductAddOnsFormSectionProps> = memo(({ className, product }) => {
    // Access form context from the parent form
    const form = useFormContext<CostumeFormValues & { addOns: ProductAddOn[] }>();

    // Use fieldArray to manage dynamic fields
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "addOns",
    });

    // Initialize with product's add-ons if they exist
    React.useEffect(() => {
        if (product?.addOns && product.addOns.length > 0) {
            form.setValue("addOns", product.addOns.map(addOn => ({
                ...addOn,
                image: addOn.image || null
            })));
        }
    }, [product, form]);

    // Local state to track image previews
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

    // Handler for image uploads
    const handleImageUpload = useCallback((id: string, file: File | null) => {
        // Update the form value
        form.setValue(`addOns.${fields.findIndex(field => field.id === id)}.image`, file);

        // Update the preview
        if (file) {
            const preview = URL.createObjectURL(file);
            setImagePreviews(prev => ({ ...prev, [id]: preview }));
        } else {
            setImagePreviews(prev => {
                const newPreviews = { ...prev };
                // Revoke the object URL to prevent memory leaks
                if (newPreviews[id]) {
                    URL.revokeObjectURL(newPreviews[id]);
                    delete newPreviews[id];
                }
                return newPreviews;
            });
        }
    }, [fields, form]);

    // Add a new feature
    const addFeature = useCallback(() => {
        append({
            id: `feature-${Date.now()}`,
            name: "",
            description: "",
            price: "",
            image: null
        });
    }, [append]);

    // Remove a feature
    const removeFeature = useCallback((index: number, id: string) => {
        // Clean up image preview URL if it exists
        if (imagePreviews[id]) {
            URL.revokeObjectURL(imagePreviews[id]);
            setImagePreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[id];
                return newPreviews;
            });
        }
        remove(index);
    }, [imagePreviews, remove]);

    // Clean up effect on unmount
    React.useEffect(() => {
        return () => {
            // Clean up all object URLs to prevent memory leaks
            Object.values(imagePreviews).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [imagePreviews]);

    // Memoize the file input click handler to prevent unnecessary re-renders
    const handleFileInputClick = useCallback((id: string) => {
        const fileInput = document.getElementById(`addon-image-${id}`);
        if (fileInput) {
            fileInput.click();
        }
    }, []);

    return (
        <Card className={cn("shadow-sm", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Costume Add-Ons & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        No add-ons added yet. Add special features or accessories that come with this costume.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="border border-gray-200">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            {/* Add-On Name */}
                                            <FormField
                                                control={form.control}
                                                name={`addOns.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Add-On Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="E.g., Premium Wig, Extra Accessories, etc."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Add-On Description */}
                                            <FormField
                                                control={form.control}
                                                name={`addOns.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe this add-on feature..."
                                                                className="resize-none h-24"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Add-On Price */}
                                            <FormField
                                                control={form.control}
                                                name={`addOns.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Additional Price</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2">₱</span>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    className="pl-8"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Image Upload Section */}
                                        <div className="space-y-2">
                                            <FormLabel>Add-On Image</FormLabel>
                                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center h-[250px] relative">
                                                {imagePreviews[field.id] ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={imagePreviews[field.id] || ''}
                                                            alt={`Preview for ${form.getValues(`addOns.${index}.name`) || 'add-on'}`}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => handleImageUpload(field.id, null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                                        <p className="text-sm text-muted-foreground mb-2">Upload an image of this add-on</p>
                                                        <Input
                                                            type="file"
                                                            id={`addon-image-${field.id}`}
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null;
                                                                handleImageUpload(field.id, file);
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => handleFileInputClick(field.id)}
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            Choose Image
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end py-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeFeature(index, field.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="flex items-center"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Feature
                </Button>
            </CardFooter>
        </Card>
    );
});

ProductAddOnsFormSection.displayName = 'ProductAddOnsFormSection';

export default ProductAddOnsFormSection;