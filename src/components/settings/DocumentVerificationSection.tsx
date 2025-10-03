// components/DocumentVerificationSection.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Smartphone } from "lucide-react";
import Image from "next/image";
import { Control, useWatch } from "react-hook-form";


import { LenderSignUpFormData } from "@/lib/zodSchema/lenderSchema";
import selfieWithId from "../../../../public/images/selfiewithid.jpg";
import { FileUploader } from "../Lender/SignUpForms/FileUploader";
import { StoreDocumentsSection } from "../Lender/SignUpForms/StoreDocumentsSection";
import { IconInputField } from "./FormFIelds";

interface DocumentVerificationSectionProps {
    control: Control<LenderSignUpFormData>;
}

export const DocumentVerificationSection = ({ control }: DocumentVerificationSectionProps) => {
    const hasValidId = useWatch({
        control,
        name: "hasValidId",
        defaultValue: true,
    });

    const businessType = useWatch({
        control,
        name: "businessType"
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 pb-2 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg ">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Verification Documents</h3>
                    <p className="text-sm text-muted-foreground">Upload required identification documents</p>
                </div>
            </div>

            {/* Store Documents Section - Only show for STORE business type */}
            {businessType === "STORE" && (
                <div className="space-y-6">
                    <StoreDocumentsSection control={control} />
                    <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">Personal Identification</h4>
                    </div>
                </div>
            )}

            {/* Valid ID Toggle */}
            <FormField
                control={control}
                name="hasValidId"
                defaultValue={true}
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 ">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">I have a valid government ID</FormLabel>
                            <p className="text-sm text-muted-foreground">Toggle if you have a primary government-issued ID</p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value ?? true}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {hasValidId ? (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <FormField
                            control={control}
                            name="validIdType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Valid ID Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select ID type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UMID">UMID</SelectItem>
                                            <SelectItem value="PASSPORT">Passport</SelectItem>
                                            <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                                            <SelectItem value="PHILHEALTH_ID">PhilHealth ID</SelectItem>
                                            <SelectItem value="SSS_ID">SSS ID</SelectItem>
                                            <SelectItem value="POSTAL_ID">Postal ID</SelectItem>
                                            <SelectItem value="VOTERS_ID">Voter's ID</SelectItem>
                                            <SelectItem value="PRC_ID">PRC ID</SelectItem>
                                            <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                                            <SelectItem value="GSIS_ID">GSIS ID</SelectItem>
                                            <SelectItem value="SENIOR_CITIZEN_ID">Senior Citizen ID</SelectItem>
                                            <SelectItem value="PWD_ID">PWD ID</SelectItem>
                                            <SelectItem value="INTEGRATED_BAR_ID">Integrated Bar ID</SelectItem>
                                            <SelectItem value="OFW_ID">OFW ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <IconInputField
                            control={control}
                            name="validIdNumber"
                            label="ID Number"
                            placeholder="Enter ID number"
                            type="text"
                            icon={Smartphone}
                            fieldType="text"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <FileUploader
                            control={control}
                            name="validIdFile"
                            label="Upload Valid ID"
                            description="Upload a clear copy of your valid ID"
                        />

                        <FileUploader
                            control={control}
                            name="selfieWithId"
                            label="Selfie with ID"
                            description="Upload a clear selfie holding your ID"
                            required={true}
                            maxSize={5} // 5MB
                            acceptedFileTypes={['image/jpeg', 'image/png']}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <FormField
                            control={control}
                            name="secondaryIdType1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">First Supporting Document</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SCHOOL_ID">School ID</SelectItem>
                                            <SelectItem value="COMPANY_ID">Company ID</SelectItem>
                                            <SelectItem value="BARANGAY_ID">Barangay ID</SelectItem>
                                            <SelectItem value="POLICE_CLEARANCE">Police Clearance</SelectItem>
                                            <SelectItem value="NBI_CLEARANCE">NBI Clearance</SelectItem>
                                            <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                                            <SelectItem value="TIN_ID">TIN ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FileUploader
                            control={control}
                            name="secondaryIdFile1"
                            label="Upload First Document"
                            description="Upload a clear copy of your first supporting document"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <FormField
                            control={control}
                            name="secondaryIdType2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Second Supporting Document</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SCHOOL_ID">School ID</SelectItem>
                                            <SelectItem value="COMPANY_ID">Company ID</SelectItem>
                                            <SelectItem value="BARANGAY_ID">Barangay ID</SelectItem>
                                            <SelectItem value="POLICE_CLEARANCE">Police Clearance</SelectItem>
                                            <SelectItem value="NBI_CLEARANCE">NBI Clearance</SelectItem>
                                            <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                                            <SelectItem value="TIN_ID">TIN ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FileUploader
                            control={control}
                            name="secondaryIdFile2"
                            label="Upload Second Document"
                            description="Upload a clear copy of your second supporting document"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <Image
                                src={selfieWithId}
                                alt="Selfie with ID Example"
                                className="w-full h-auto max-h-48 object-contain rounded"
                                width={200}
                                height={200}
                            />
                        </div>

                        <FileUploader
                            control={control}
                            name="selfieWithId"
                            label="Selfie with ID"
                            description="Upload a clear selfie holding your ID"
                            required={true}
                            maxSize={5} // 5MB
                            acceptedFileTypes={['image/jpeg', 'image/png']}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};