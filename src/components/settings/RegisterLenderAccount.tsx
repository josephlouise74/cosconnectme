"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegisterLenderAccount } from "@/lib/api/lenderApi";
/* import { useRegisterLenderAccount } from "@/lib/apis/lenderApiV2"; */
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { LenderSignUpFormData, lenderSignUpSchema } from "@/lib/zodSchema/lenderSchema";
import { handleSingleImageUpload } from "@/utils/supabase/fileUpload";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Store } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BusinessInfoSection } from "../Lender/SignUpForms/BusinessInfoSection";
import { DocumentVerificationSection } from "../Lender/SignUpForms/DocumentVerificationInfoSection";

// Types
interface FileUploadState {
    isUploading: boolean;
    uploadProgress: number;
}

interface TabState {
    current: "business" | "document" | "security";
    completed: Set<string>;
}

// Constants
const REQUIRED_BUSINESS_FIELDS = [
    "businessName",
    "businessType",
    "street",
    "barangay",
    "city",
    "province",
    "region",
    "zipCode",
    "businessPhoneNumber",
    "businessEmail"
] as const;

const FORM_DEFAULT_VALUES: LenderSignUpFormData = {
    hasValidId: true,
    businessName: "",
    businessType: "STORE" as const,
    businessDescription: "",
    businessPhoneNumber: "+63 ",
    businessEmail: "",
    business_telephone: "",
    street: "",
    barangay: "",
    city: { id: "", name: "" },
    province: "",
    region: "",
    zipCode: "",
    validIdType: "NATIONAL_ID" as const,
    validIdNumber: "",
    validIdFile: null,
    secondaryIdType1: "BARANGAY_ID" as const,
    secondaryIdFile1: null,
    secondaryIdType2: "POLICE_CLEARANCE" as const,
    secondaryIdFile2: null,
    selfieWithId: null,
    upload_dti_certificate: null,
    upload_business_permit: null,
    upload_storefront_photo: null,
};

const TABS = [
    { id: "business", label: "Business", order: 0 },
    { id: "document", label: "Documents", order: 1 },
    { id: "security", label: "Security", order: 2 }
] as const;

// Pending Verification Component
const PendingVerificationView = () => (
    <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className=" w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Lender Registration Pending
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Your lender registration is currently under review. You will be notified once your account has been verified.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
);

// Main Component
const RegisterSellerAccount = () => {
    // State management
    const [tabState, setTabState] = useState<TabState>({
        current: "business",
        completed: new Set()
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
        isUploading: false,
        uploadProgress: 0
    });
    const [profileError, setProfileError] = useState<string>("");

    // Hooks - ALL hooks must be called before any early returns
    const form = useForm<LenderSignUpFormData>({
        resolver: zodResolver(lenderSignUpSchema),
        defaultValues: FORM_DEFAULT_VALUES,
        mode: "onChange" // Optimize validation
    });


    const { userRolesData } = useSupabaseAuth();
    const {
        mutateAsync: registerLenderAccount,
        isLoading: isRegistering,
        isSuccess,
    } = useRegisterLenderAccount();

    // Memoized computed values
    const isPendingVerification = useMemo(() =>
        userRolesData?.status === "pending_verification",
        [userRolesData?.status]
    );

    const isProcessing = useMemo(() =>
        fileUploadState.isUploading || isRegistering,
        [fileUploadState.isUploading, isRegistering]
    );

    const currentTabIndex = useMemo(() =>
        TABS.findIndex(tab => tab.id === tabState.current),
        [tabState.current]
    );

    // File upload handler with progress
    const uploadFile = useCallback(async (file: File, errorMessage: string): Promise<string> => {
        try {
            const uploadResult = await handleSingleImageUpload(file);
            if (uploadResult.error) {
                throw new Error(`${errorMessage}: ${uploadResult.error}`);
            }
            return uploadResult.url as string;
        } catch (error) {
            console.error("File upload error:", error);
            throw error;
        }
    }, []);

    // Optimized file preparation with batch processing
    const prepareFormData = useCallback(async (data: LenderSignUpFormData): Promise<LenderSignUpFormData> => {
        setFileUploadState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

        try {
            // Explicitly copy all fields, including businessEmail
            const preparedData: LenderSignUpFormData = { ...data, businessEmail: data.businessEmail };
            const uploadTasks: Promise<void>[] = [];
            let completedUploads = 0;

            const updateProgress = () => {
                completedUploads++;
                setFileUploadState(prev => ({
                    ...prev,
                    uploadProgress: (completedUploads / uploadTasks.length) * 100
                }));
            };

            // Batch file uploads
            const addUploadTask = (
                file: File | null | string,
                key: keyof LenderSignUpFormData,
                errorMessage: string
            ) => {
                if (file instanceof File) {
                    uploadTasks.push(
                        uploadFile(file, errorMessage).then(url => {
                            (preparedData as any)[key] = url;
                            updateProgress();
                        })
                    );
                }
            };

            // Handle Valid ID File Upload
            if (data.hasValidId && data.validIdFile instanceof File) {
                addUploadTask(data.validIdFile, 'validIdFile', "Failed to upload valid ID");
            }

            // Handle Secondary ID Files Upload
            if (!data.hasValidId) {
                addUploadTask(data.secondaryIdFile1, 'secondaryIdFile1', "Failed to upload first secondary ID");
                addUploadTask(data.secondaryIdFile2, 'secondaryIdFile2', "Failed to upload second secondary ID");
            }

            // Handle Selfie with ID Upload
            addUploadTask(data.selfieWithId, 'selfieWithId', "Failed to upload selfie with ID");

            // Handle Store Documents Upload (only for STORE type)
            if (data.businessType === "STORE") {
                addUploadTask(data.upload_dti_certificate, 'upload_dti_certificate', "Failed to upload DTI Certificate");
                addUploadTask(data.upload_business_permit, 'upload_business_permit', "Failed to upload Business Permit");
                addUploadTask(data.upload_storefront_photo, 'upload_storefront_photo', "Failed to upload Storefront Photo");
            }

            // Execute all uploads concurrently
            if (uploadTasks.length > 0) {
                await Promise.all(uploadTasks);
            }

            // Ensure businessEmail is always present
            if (!preparedData.businessEmail) {
                preparedData.businessEmail = data.businessEmail;
            }

            return preparedData;
        } finally {
            setFileUploadState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
        }
    }, [uploadFile]);

    // Optimized data formatting
    const formatLenderData = useCallback((preparedData: LenderSignUpFormData, termsAccepted: boolean) => ({
        business_info: {
            business_name: preparedData.businessName,
            business_type: preparedData.businessType,
            business_description: preparedData.businessDescription,
            business_phone_number: preparedData.businessPhoneNumber,
            business_email: preparedData.businessEmail,
            business_telephone: preparedData.business_telephone,
            business_address: `${preparedData.street}, ${preparedData.barangay}, ${preparedData.city.name}, ${preparedData.province}, ${preparedData.region}, ${preparedData.zipCode}`,
            street: preparedData.street,
            barangay: preparedData.barangay,
            city: preparedData.city,
            province: preparedData.province,
            region: preparedData.region,
            zip_code: preparedData.zipCode,
            terms_and_conditions: termsAccepted ? "Accepted" : "Not Accepted",
            ...(preparedData.businessType === "STORE" && {
                upload_dti_certificate: preparedData.upload_dti_certificate,
                upload_business_permit: preparedData.upload_business_permit,
                upload_storefront_photo: preparedData.upload_storefront_photo,
            }),
        },
        identification: {
            has_valid_id: preparedData.hasValidId,
            selfie_with_id: preparedData.selfieWithId,
            ...(preparedData.hasValidId
                ? {
                    valid_id_type: preparedData.validIdType,
                    valid_id_number: preparedData.validIdNumber,
                    valid_id_file: preparedData.validIdFile,
                }
                : {
                    secondary_id_type_1: preparedData.secondaryIdType1,
                    secondary_id_file_1: preparedData.secondaryIdFile1,
                    secondary_id_type_2: preparedData.secondaryIdType2,
                    secondary_id_file_2: preparedData.secondaryIdFile2,
                }),
        },
        personal_info: {
            first_name: userRolesData?.personal_info?.first_name || "",
            last_name: userRolesData?.personal_info?.last_name || "",
            full_name: userRolesData?.personal_info?.full_name || "",
            username: userRolesData?.username || "",
            email: userRolesData?.email || "",
            phone_number: userRolesData?.personal_info?.phone_number || ""
        },
    }), [userRolesData]);

    // Form submission handler
    const onSubmit = useCallback(async (values: LenderSignUpFormData) => {
        try {
            setProfileError(""); // Reset error on submit
            // Validate personal info fields
            const requiredFields = [
                userRolesData?.personal_info?.first_name,
                userRolesData?.personal_info?.last_name,
                userRolesData?.username,
                userRolesData?.email,
                userRolesData?.personal_info?.phone_number
            ];
            if (requiredFields.some(field => !field || field.trim() === "")) {
                setProfileError(
                    `Some required personal information is missing. Please update your profile before registering as a lender.`
                );
                return;
            }
            if (!termsAccepted) {
                toast.error("Please accept the Terms and Conditions to proceed");
                return;
            }

            const preparedData = await prepareFormData(values);
            const lenderData = formatLenderData(preparedData, termsAccepted);

            const userId = userRolesData?.user_id;
            if (!userId) {
                throw new Error("User ID is required");
            }

            console.log("lenderData", lenderData);

            await registerLenderAccount({
                userId,
                lenderData: lenderData as any,
            });


            window.location.reload();

        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Registration failed. Please try again.");
        }
    }, [termsAccepted, prepareFormData, formatLenderData, userRolesData?.user_id, registerLenderAccount, userRolesData]);

    // Tab navigation handlers
    const validateAndNextTab = useCallback(async () => {
        const currentTab = tabState.current;

        if (currentTab === "business") {
            const isValid = await form.trigger([...REQUIRED_BUSINESS_FIELDS] as any);

            if (isValid) {
                setTabState(prev => ({
                    current: "document",
                    completed: new Set([...prev.completed, "business"])
                }));
            } else {
                toast.error("Please complete all required fields");
            }
        } else if (currentTab === "document") {
            setTabState(prev => ({
                current: "security",
                completed: new Set([...prev.completed, "document"])
            }));
        }
    }, [tabState.current, form]);

    const goToPreviousTab = useCallback(() => {
        const currentIndex = currentTabIndex;
        if (currentIndex > 0) {
            const previousTab = TABS[currentIndex - 1];
            setTabState(prev => ({
                ...prev,
                current: previousTab?.id as any
            }));
        }
    }, [currentTabIndex]);

    // Handle successful registration
    useEffect(() => {
        if (isSuccess) {
            form.reset(FORM_DEFAULT_VALUES);
            toast.success("Lender account registration successful! You can now list your costumes.");
        }
    }, [isSuccess, form]);

    // Early return after all hooks
    if (isPendingVerification) {
        return <>
            <PendingVerificationView />
        </>
    }

    return (
        <>
            <FullScreenLoader
                isVisible={isProcessing}
                message={
                    fileUploadState.isUploading
                        ? `Uploading Files... ${Math.round(fileUploadState.uploadProgress)}%`
                        : "Creating Lender Account..."
                }
            />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Register as a Lender
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                By registering as a lender, you'll be able to list and rent out your costumes to other users.
                                This will create a separate lender account linked to your current borrower account.
                            </AlertDescription>
                        </Alert>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Show profile error if present */}
                                {profileError && (
                                    <div className="mb-4 text-red-600 text-sm">
                                        {profileError} {" "}
                                        <Link href={"/settings"}
                                            className="text-blue-600 underline ml-1">
                                            Go to Profile
                                        </Link>
                                    </div>
                                )}
                                <Tabs
                                    value={tabState.current}
                                    onValueChange={(value) => setTabState(prev => ({ ...prev, current: value as any }))}
                                    className="w-full"
                                >
                                    <TabsList className="grid grid-cols-3 mb-8">
                                        {TABS.map((tab) => (
                                            <TabsTrigger
                                                key={tab.id}
                                                value={tab.id}
                                                disabled={isProcessing}
                                                className={tabState.completed.has(tab.id) ? "text-green-600" : ""}
                                            >
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <TabsContent value="business" className="space-y-6">
                                        <BusinessInfoSection control={form.control} />
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={validateAndNextTab}
                                                disabled={isProcessing}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="document" className="space-y-6">
                                        <DocumentVerificationSection control={form.control} />
                                        <div className="flex justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={goToPreviousTab}
                                                disabled={isProcessing}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={validateAndNextTab}
                                                disabled={isProcessing}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="security" className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Terms and Conditions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Please review and accept the terms and conditions to complete your lender registration.
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4">
                                            <Checkbox
                                                id="terms"
                                                checked={termsAccepted}
                                                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                                disabled={isProcessing}
                                            />
                                            <Label htmlFor="terms" className="text-sm">
                                                I agree to the{" "}
                                                <Link href="/terms" className="text-blue-600 hover:underline">
                                                    Terms and Conditions
                                                </Link>{" "}
                                                and{" "}
                                                <Link href="/privacy" className="text-blue-600 hover:underline">
                                                    Privacy Policy
                                                </Link>
                                            </Label>
                                        </div>

                                        <div className="flex justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={goToPreviousTab}
                                                disabled={isProcessing}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isProcessing || !termsAccepted}
                                                className="cursor-pointer"
                                            >
                                                Register as Lender
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default RegisterSellerAccount;