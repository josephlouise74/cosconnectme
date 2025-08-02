import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2 } from "lucide-react";
import { Control } from "react-hook-form";

import { FileUploader } from "./FileUploader";
import { LenderSignUpFormData } from "@/lib/zodSchema/lenderSchema";

interface StoreDocumentsSectionProps {
    control: Control<LenderSignUpFormData>;
}

export const StoreDocumentsSection = ({ control }: StoreDocumentsSectionProps) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-2 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg ">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold ">Store Documents</h3>
                    <p className="text-sm text-muted-foreground">Required for registered stores</p>
                </div>
            </div>

            {/* Info Alert */}
            <Alert className="">
                <AlertCircle className="h-4 w-4 " />
                <AlertDescription className="">
                    Upload these 3 documents if you're a registered store (DTI Certificate, Business Permit, Storefront Photo)
                </AlertDescription>
            </Alert>

            {/* Documents Grid */}
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <FileUploader
                        control={control}
                        name="upload_dti_certificate"
                        label="DTI Certificate"
                        description="Upload your DTI Certificate or Registration"
                        required={true}
                        maxSize={5} // 5MB
                        acceptedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                    />

                    <FileUploader
                        control={control}
                        name="upload_business_permit"
                        label="Business Permit"
                        description="Upload your Business Permit or Mayor's Permit"
                        required={true}
                        maxSize={5} // 5MB
                        acceptedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                    />
                </div>

                <div className="lg:col-span-2">
                    <FileUploader
                        control={control}
                        name="upload_storefront_photo"
                        label="Storefront Photo"
                        description="Upload a clear photo of your storefront or business location"
                        required={true}
                        maxSize={5} // 5MB
                        acceptedFileTypes={['image/jpeg', 'image/png']}
                    />
                </div>
            </div>
        </div>
    );
}; 