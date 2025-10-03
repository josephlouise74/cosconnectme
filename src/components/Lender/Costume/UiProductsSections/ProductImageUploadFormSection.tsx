import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import FileUploader from './ProductFileUploader';


interface ProductImagesUploadProps {
    mainImages: any;
    additionalImages: any[];
    touched?: Record<string, boolean>;
    errors: {
        frontImage?: string;
        backImage?: string;
        additionalImages?: string;
    };
    handleMainImageUpload: (type: 'front' | 'back', file: File | null) => void;
    handleAdditionalImagesUpload: (files: File[]) => void;
    removeAdditionalImage: (id: string) => void;
    handleDragEnd: (result: DropResult) => void;
    // For editing existing products
    existingImages?: {
        front?: string;
        back?: string;
        additional?: { id: string, url: string }[];
    };
}

const ProductImagesUpload: React.FC<ProductImagesUploadProps> = ({
    mainImages,
    additionalImages,
    touched,
    errors,
    handleMainImageUpload,
    handleAdditionalImagesUpload,
    removeAdditionalImage,
    handleDragEnd,
    existingImages
}) => {
    return (
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Costume Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="front-image" className="mb-2 block">Front Image*</Label>
                        <FileUploader
                            onFilesUpload={(files: any) => handleMainImageUpload('front', files[0] as any)}
                            maxFiles={1}
                            accept="image/*"
                            maxSize={10 * 1024 * 1024}
                            label="Upload Front Image"
                        />
                        {touched?.frontImage && errors.frontImage && (
                            <p className="mt-2 text-xs text-red-500">{errors.frontImage}</p>
                        )}
                        {mainImages.front && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={URL.createObjectURL(mainImages.front)}
                                    alt="Front Product"
                                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => handleMainImageUpload('front', null)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        {!mainImages.front && existingImages?.front && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={existingImages.front}
                                    alt="Front Product"
                                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => handleMainImageUpload('front', null)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="back-image" className="mb-2 block">Back Image*</Label>
                        <FileUploader
                            onFilesUpload={(files: any) => handleMainImageUpload('back', files[0] as any)}
                            maxFiles={1}
                            accept="image/*"
                            maxSize={10 * 1024 * 1024}
                            label="Upload Back Image"
                        />
                        {touched?.backImage && errors.backImage && (
                            <p className="mt-2 text-xs text-red-500">{errors.backImage}</p>
                        )}
                        {mainImages.back && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={URL.createObjectURL(mainImages.back)}
                                    alt="Back Product"
                                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => handleMainImageUpload('back', null)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        {!mainImages.back && existingImages?.back && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={existingImages.back}
                                    alt="Back Product"
                                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => handleMainImageUpload('back', null)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Product Images (Multiple) */}
                <div>
                    <Label className="mb-2 block">Additional Images (Optional)</Label>
                    <FileUploader
                        onFilesUpload={handleAdditionalImagesUpload}
                        multiple={true}
                        accept="image/*"
                        maxSize={10 * 1024 * 1024}
                        label="Upload Additional Images"
                    />
                </div>

                {/* Sortable Additional Images */}
                {(additionalImages.length > 0 || (existingImages?.additional && existingImages.additional.length > 0)) && (
                    <div>
                        <Label className="mb-2 block">Organize Additional Images</Label>
                        <p className="text-xs  mb-2">Drag to reorder images</p>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="additional-images" direction="horizontal">
                                {(provided) => (
                                    <div
                                        className="flex flex-wrap gap-4 mt-2"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {/* Newly uploaded additional images */}
                                        {additionalImages.map((image, index) => (
                                            <Draggable key={image.id} draggableId={image.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="relative"
                                                    >
                                                        <div className="relative group">
                                                            <img
                                                                src={image.preview}
                                                                alt={`Additional ${index + 1}`}
                                                                className="w-24 h-24 object-cover rounded-md border border-gray-200 transition-all group-hover:shadow-md"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                                onClick={() => removeAdditionalImage(image.id)}
                                                                type="button"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {/* Existing additional images */}
                                        {existingImages?.additional?.map((image, index) => (
                                            <Draggable
                                                key={image.id}
                                                draggableId={image.id}
                                                index={additionalImages.length + index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="relative"
                                                    >
                                                        <div className="relative group">
                                                            <img
                                                                src={image.url}
                                                                alt={`Additional ${additionalImages.length + index + 1}`}
                                                                className="w-24 h-24 object-cover rounded-md border border-gray-200 transition-all group-hover:shadow-md"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                                onClick={() => removeAdditionalImage(image.id)}
                                                                type="button"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                                                                {additionalImages.length + index + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductImagesUpload;