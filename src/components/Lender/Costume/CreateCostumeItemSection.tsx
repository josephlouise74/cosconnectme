"use client";

import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";

import { DropResult } from "@hello-pangea/dnd";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';


import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { costumeFormSchema, CostumeFormValues } from '@/lib/zodSchema/costumeSchema';
import { AdditionalImageType, MainImagesType } from '@/lib/types/costume';
import { uploadImage } from '@/utils/supabase/fileUpload';
import { RentPriceDetailsCard, SalePriceDetailsCard } from './UiProductsSections/PriceDetailsCard';
import { createCostumeApi } from '@/lib/api/costumeApi';

// Lazy load components
const ProductImagesUpload = lazy(() => import('./UiProductsSections/ProductImageUploadFormSection'));
const ProductInformationFormSection = lazy(() => import('./UiProductsSections/ProductInformationFormSection'));
const ProductPreview = lazy(() => import('./UiProductsSections/ProductReview'));

// Main Component
const CreateCostumeItemSection: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, userRolesData, isLoading: authLoading } = useSupabaseAuth();
    const queryClient = useQueryClient();

    // Check authentication and redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please sign in to create a costume');
            router.push('/signin');
        }
    }, [isAuthenticated, authLoading, router]);

    // Loading states
    const [isUploading, setIsUploading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Combined loading state
    const isLoading = isUploading || isCreating || authLoading;

    useEffect(() => {
        const queryKey = ['products', 'list', userRolesData?.user_id];
        const cached = queryClient.getQueryData(queryKey);
        console.log('Cached data:', cached);
    }, [queryClient, userRolesData?.user_id]);

    // Custom validation state for images
    const [imageErrors, setImageErrors] = useState<{
        frontImage?: string;
        backImage?: string;
        additionalImages?: string;
    }>({});

    // Form setup with zod validation - FIXED: Using proper CostumeFormValues type
    const form = useForm<CostumeFormValues>({
        resolver: zodResolver(costumeFormSchema),
        defaultValues: {
            name: '',
            brand: '',
            gender: 'unisex',
            description: '',
            discount: '',
            price: '',
            tags: [],
            category: '',
            addOns: [],
            sizes: '',
            listingType: 'rent',
            security_deposit: '',
            extended_days: '',
            sale_price: '',
            costumeType: 'costume_only'
        }
    });

    const {
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = form;

    // Watch form values
    const tags = watch('tags') || [];

    const listingType = watch('listingType');

    // Image states
    const [mainImages, setMainImages] = useState<MainImagesType>({
        front: null,
        back: null
    });

    const [additionalImages, setAdditionalImages] = useState<AdditionalImageType[]>([]);

    // Handler for Adding Tags
    const handleAddTag = useCallback((tag: string) => {
        if (!tags.includes(tag)) {
            setValue('tags', [...tags, tag], { shouldValidate: true });
        }
    }, [tags, setValue]);

    // Handler for Removing Tags
    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setValue('tags', tags.filter((tag: string) => tag !== tagToRemove), { shouldValidate: true });
    }, [tags, setValue]);

    // Handlers
    const handleMainImageUpload = useCallback((type: 'front' | 'back', file: File | null) => {
        setMainImages(prev => ({
            ...prev,
            [type]: file
        }));

        // Clear error when uploading
        if (file) {
            setImageErrors(prev => ({
                ...prev,
                [`${type}Image`]: undefined
            }));
        }
    }, []);

    const handleAdditionalImagesUpload = useCallback((files: File[]) => {
        const newFiles = files.map((file, index) => ({
            id: `image-${Date.now()}-${index}`,
            file,
            preview: URL.createObjectURL(file)
        }));

        setAdditionalImages(prev => [...prev, ...newFiles]);
    }, []);

    const removeAdditionalImage = useCallback((id: string) => {
        setAdditionalImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            // Cleanup URLs to prevent memory leaks
            const removedImage = prev.find(img => img.id === id);
            if (removedImage) {
                URL.revokeObjectURL(removedImage.preview);
            }
            return filtered;
        });
    }, []);

    const handleDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        setAdditionalImages(prev => {
            const items = Array.from(prev);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination!.index, 0, reorderedItem as any);
            return items;
        });
    }, []);

    const validateImages = (): boolean => {
        let isValid = true;
        const newErrors: typeof imageErrors = {};

        if (!mainImages.front) {
            newErrors.frontImage = "Front image is required";
            isValid = false;
        }

        if (!mainImages.back) {
            newErrors.backImage = "Back image is required";
            isValid = false;
        }

        setImageErrors(newErrors);
        return isValid;
    };

    const prepareData = async (data: CostumeFormValues) => {
        try {
            // Upload main images
            const frontImageUpload = await uploadImage({ file: mainImages.front as File });
            const backImageUpload = await uploadImage({ file: mainImages.back as File });

            if (!frontImageUpload.url || !backImageUpload.url) {
                const frontError = frontImageUpload.error || 'Failed to upload front image';
                const backError = backImageUpload.error || 'Failed to upload back image';

                if (!frontImageUpload.url && !backImageUpload.url) {
                    throw new Error(`Failed to upload main images: ${frontError}, ${backError}`);
                } else if (!frontImageUpload.url) {
                    throw new Error(`Failed to upload front image: ${frontError}`);
                } else {
                    throw new Error(`Failed to upload back image: ${backError}`);
                }
            }

            // Upload additional images and track their order
            const additionalImageUploads = await Promise.all(
                additionalImages.map(async (img, index) => {
                    const upload = await uploadImage({ file: img.file });
                    if (!upload.url) {
                        const errorMessage = upload.error || `Failed to upload additional image ${index + 1}`;
                        console.error(`Upload failed for additional image ${index + 1}:`, errorMessage);
                        throw new Error(errorMessage);
                    }
                    return {
                        url: upload.url,
                        order: index + 1
                    };
                })
            );

            // Upload add-on images only if listingType allows add-ons (sale or both)
            let addOnsWithImages: any[] = [];
            if (data.listingType === 'sale' || data.listingType === 'both') {
                addOnsWithImages = await Promise.all(
                    (data.addOns || []).map(async (addon, index) => {
                        if (addon.image) {
                            const upload = await uploadImage({ file: addon.image as File });
                            if (!upload.url) {
                                const errorMessage = upload.error || `Failed to upload add-on image ${index + 1}`;
                                console.error(`Upload failed for add-on image ${index + 1}:`, errorMessage);
                                throw new Error(errorMessage);
                            }
                            return {
                                ...addon,
                                image: upload.url
                            };
                        }
                        return {
                            ...addon,
                            image: null
                        };
                    })
                );
            }



            // Prepare the final data object based on listingType
            let preparedData: any = {
                mainImages: {
                    front: frontImageUpload.url,
                    back: backImageUpload.url
                },
                additionalImages: additionalImageUploads,
                addOns: (data.listingType === 'sale' || data.listingType === 'both') ? addOnsWithImages : [],
                sizes: data.sizes,
                lenderUser: {
                    uid: userRolesData?.user_id,
                    email: userRolesData?.email,
                    username: userRolesData?.personal_info?.username,
                },
                name: data.name,
                brand: data.brand,
                gender: data.gender,
                costumeType: data.costumeType, // Add costumeType to the prepared data
                description: data.description,
                tags: data.tags,
                category: data.category,
                listingType: data.listingType,
                price: data.price || '0',
                discount: data.discount || '0',
            };

            if (data.listingType === 'rent' || data.listingType === 'both') {
                preparedData = {
                    ...preparedData,
                    security_deposit: data.security_deposit,
                    extended_days: data.extended_days,
                };
            }

            if (data.listingType === 'sale' || data.listingType === 'both') {
                preparedData = {
                    ...preparedData,
                    sale_price: data.sale_price,
                };
            }

            return preparedData;
        } catch (error) {
            console.error('Error preparing data:', error);
            throw error;
        }
    };

    const onSubmit = async (data: CostumeFormValues) => {
        try {

            // Validate images first
            const imagesValid = validateImages();
            if (!imagesValid) {
                toast.error('Please upload both front and back images');
                return;
            }

            // Start upload process
            setIsUploading(true);

            try {
                // Prepare data with uploaded images
                const preparedData = await prepareData(data);
                console.log("preparedData", preparedData);
                console.log("userRolesData", userRolesData);

                // Submit to API using the direct function
                setIsCreating(true);
                await createCostumeApi(preparedData);
                // Invalidate queries for this lender and all costumes
                toast.success('Costume created successfully!');
                /*     router.push('/lender/products/list'); */
            } finally {
                setIsUploading(false);
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Error submitting form:', error);

            // Provide more specific error messages based on the error type
            let errorMessage = 'Failed to create costume. Please try again.';

            if (error instanceof Error) {
                if (error.message.includes('upload')) {
                    errorMessage = `Upload failed: ${error.message}`;
                } else if (error.message.includes('authentication') || error.message.includes('JWT')) {
                    errorMessage = 'Authentication error. Please log in again.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage);
        }
    };


    // Cleanup function for URL objects
    useEffect(() => {
        return () => {
            additionalImages.forEach(img => {
                URL.revokeObjectURL(img.preview);
            });
        };
    }, [additionalImages]);

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="w-full my-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col space-y-2 mb-8">
                        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="min-h-[400px] animate-pulse bg-slate-100 rounded-md"></div>
                        <div className="space-y-6">
                            <div className="min-h-[200px] animate-pulse bg-slate-100 rounded-md"></div>
                            <div className="min-h-[300px] animate-pulse bg-slate-100 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full my-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col space-y-2 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Create New Costume</h1>
                        <p className="text-muted-foreground">
                            Add your costume details and start earning by {listingType === 'rent' ? 'renting it out' : listingType === 'sale' ? 'selling it' : 'renting or selling it'}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Suspense fallback={<div className="min-h-[400px] animate-pulse bg-slate-100 rounded-md"></div>}>
                                <ProductPreview
                                    formData={getValues()}
                                    mainImages={mainImages}
                                    existingImages={null}
                                />
                            </Suspense>
                        </div>

                        <div className="space-y-6">
                            {/* Main Costume Images Upload (Front & Back) */}
                            <Suspense fallback={<div className="min-h-[200px] animate-pulse bg-slate-100 rounded-md"></div>}>
                                <ProductImagesUpload
                                    mainImages={mainImages}
                                    additionalImages={additionalImages}
                                    errors={imageErrors}
                                    handleMainImageUpload={handleMainImageUpload}
                                    handleAdditionalImagesUpload={handleAdditionalImagesUpload}
                                    removeAdditionalImage={removeAdditionalImage}
                                    handleDragEnd={handleDragEnd}
                                />
                            </Suspense>

                            {/* Costume Information Form */}
                            <div className="space-y-6">
                                <Suspense fallback={<div className="min-h-[300px] animate-pulse bg-slate-100 rounded-md"></div>}>
                                    <ProductInformationFormSection
                                        handleAddTag={handleAddTag}
                                        handleRemoveTag={handleRemoveTag}
                                    />
                                </Suspense>

                                {/* Price Details Card (conditional by listingType) */}
                                <Suspense fallback={<div className="min-h-[100px] animate-pulse bg-slate-100 rounded-md"></div>}>
                                    {listingType === 'rent' && <RentPriceDetailsCard />}
                                    {listingType === 'sale' && <SalePriceDetailsCard />}
                                    {listingType === 'both' && (
                                        <div className="space-y-6">
                                            <RentPriceDetailsCard />
                                            <SalePriceDetailsCard />
                                        </div>
                                    )}
                                </Suspense>

                                {/* Show validation errors if any */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
                                        <ul className="text-red-600 text-sm space-y-1">
                                            {Object.entries(errors).map(([key, error]) => (
                                                <li key={key}>• {error?.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-w-28"
                                        disabled={isLoading}
                                        onClick={() => router.push('/lender/products/list')}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="min-w-32"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Costume'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default CreateCostumeItemSection;