"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useCreateRequestRentalCostume } from "@/lib/api/rentalApi"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight, Package, X } from "lucide-react"
import { useParams } from "next/navigation"
import React, { useCallback, useMemo, useState } from "react"
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form"
import { PaymentMethodForm } from "./components/PaymentMethod"
import { PersonalDetailsForm } from "./components/Personal-Info"
import { RentSummary } from "./components/RentSummary"

import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { ScheduleForm } from "./components/ScheduleForm"
import {
    BookingStep,
    BookingStepConfig,
    CostumeRentalInfo,
    PartialRentalBookingFormData,
    partialRentalBookingSchema,
    RentalBookingFormData,
    rentalBookingSchema
} from "./components/type"


// Constants
const STEP_ORDER: readonly BookingStep[] = ["schedule", "personal", "payment", "summary"] as const

const STEP_CONFIG: Record<BookingStep, { title: string; description: string }> = {
    schedule: { title: "Schedule", description: "Select dates & delivery" },
    personal: { title: "Personal Info", description: "Your details" },
    payment: { title: "Payment", description: "Payment method" },
    summary: { title: "Summary", description: "Review & confirm" }
}

// Default form values
const getDefaultFormValues = (costumeId: string = ""): PartialRentalBookingFormData => ({
    costume_id: costumeId,
    schedule: {
        start_date: "",
        end_date: "",
        delivery_method: "delivery",
        delivery_address: "",
        special_instructions: ""
    },
    personal_details: {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "+63",
        date_of_birth: ""
    },
    payment_method: {
        type: "gcash",
        gcash_number: ""
    },
    agreements: {
        terms_accepted: false,
        damage_policy: false,
        cancellation_policy: false
    }
})

// Custom hook for step management
const useStepManager = (initialStep: BookingStep = "schedule") => {
    const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep)
    const [completedSteps, setCompletedSteps] = useState<Set<BookingStep>>(new Set())

    const currentStepIndex = STEP_ORDER.indexOf(currentStep)
    const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100

    const steps: BookingStepConfig[] = useMemo(() =>
        STEP_ORDER.map((stepId) => ({
            id: stepId,
            ...STEP_CONFIG[stepId],
            isCompleted: completedSteps.has(stepId),
            isActive: currentStep === stepId
        })),
        [currentStep, completedSteps]
    )

    const canGoNext = currentStep !== "summary"
    const canGoPrevious = currentStep !== "schedule"
    const isLastStep = currentStep === "summary"

    const goToNext = useCallback(() => {
        const nextIndex = Math.min(currentStepIndex + 1, STEP_ORDER.length - 1)
        setCurrentStep(STEP_ORDER[nextIndex] as any)
    }, [currentStepIndex])

    const goToPrevious = useCallback(() => {
        const prevIndex = Math.max(currentStepIndex - 1, 0)
        setCurrentStep(STEP_ORDER[prevIndex] as any)
    }, [currentStepIndex])

    const markCompleted = useCallback((step: BookingStep) => {
        setCompletedSteps(prev => new Set([...prev, step]))
    }, [])

    return {
        currentStep,
        currentStepIndex,
        progress,
        steps,
        canGoNext,
        canGoPrevious,
        isLastStep,
        goToNext,
        goToPrevious,
        markCompleted
    }
}

// Custom hook for form submission
const useFormSubmission = (
    onBookingComplete?: (data: RentalBookingFormData, response: any) => void,
) => {
    const { createRequestRentalCostume, isRequestRentalCostumeLoading } = useCreateRequestRentalCostume()

    const submitBooking = useCallback(async (data: RentalBookingFormData) => {
        try {
            console.log("Submitting booking data:", data)

            // Validate against Zod schema
            const validatedData = rentalBookingSchema.parse(data)
            console.log("Schema validation passed:", validatedData)

            // Call the API - this should return RentalRequestResponse
            const response: any = await createRequestRentalCostume(validatedData)
            console.log("API response:", response)

            // Call the completion callback with both data and response
            onBookingComplete?.(validatedData, response)

            // Automatically redirect to checkout URL if available
            if (response?.data?.payment?.checkout_url) {
                console.log("Redirecting to checkout:", response.data.payment.checkout_url)
                // Small delay to ensure state updates are processed
                setTimeout(() => {
                    window.location.href = response.data.payment.checkout_url
                }, 100)
            }

            return response

        } catch (error) {
            console.error("Booking submission error:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to submit booking"
            console.error("Booking error:", errorMessage)
            throw new Error("Failed to process your booking. Please try again.")
        }
    }, [createRequestRentalCostume, onBookingComplete])

    return { isSubmitting: isRequestRentalCostumeLoading, submitBooking }
}


// Props interface
interface RentalBookingDialogProps {
    isOpen: boolean
    onClose: () => void
    costumeInfo: CostumeRentalInfo
    onBookingComplete?: (bookingData: RentalBookingFormData, response: any) => void
}

// Main component
export const RentalBookingDialog: React.FC<RentalBookingDialogProps> = ({
    isOpen,
    onClose,
    costumeInfo,
    onBookingComplete
}) => {
    const [rentalResponse, setRentalResponse] = useState<any | null>(null)
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

    const stepManager = useStepManager()

    // Handle successful booking completion
    const handleBookingComplete = useCallback((data: RentalBookingFormData, response: any) => {
        console.log("Booking completed:", data, response)
        setRentalResponse(response)
        setShowPaymentSuccess(true)
        onBookingComplete?.(data, response)
    }, [onBookingComplete])

    const { isSubmitting, submitBooking } = useFormSubmission(handleBookingComplete,)

    const { user } = useSupabaseAuth()

    const params = useParams()
    const costumeId = params?.id as string

    const form = useForm<PartialRentalBookingFormData>({
        resolver: zodResolver(partialRentalBookingSchema),
        defaultValues: getDefaultFormValues(costumeId),
        mode: "onChange",
        reValidateMode: "onChange",
        shouldUnregister: false,
        criteriaMode: "all"
    })

    // Debug form state
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            console.log("Form values changed:", value)
        })
        return () => subscription.unsubscribe()
    }, [form])

    // Helper function to check if a value is not empty
    const isNotEmpty = (value: any): boolean => {
        if (typeof value === 'string') {
            return value.trim() !== ''
        }
        if (typeof value === 'boolean') {
            return value === true
        }
        return value !== null && value !== undefined
    }

    // Handle PayMongo redirect
    const handlePayNow = useCallback(() => {
        if (rentalResponse?.data.payment.checkout_url) {
            // Open PayMongo checkout in a new window/tab
            window.open(rentalResponse.data.payment.checkout_url, '_blank', 'noopener,noreferrer')

            // Optionally close the dialog after opening payment
            // onClose()
        }
    }, [rentalResponse])

    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        if (!isSubmitting) {
            // Reset states when closing
            setShowPaymentSuccess(false)
            setRentalResponse(null)
            onClose()
        }
    }, [isSubmitting, onClose])

    // Step validation function
    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        const currentData = form.getValues()
        console.log("Validating step:", stepManager.currentStep, "with data:", currentData)

        try {
            let isValid = true

            switch (stepManager.currentStep) {
                case "schedule":
                    if (!currentData.schedule) {
                        console.warn("Schedule data is missing")
                        return false
                    }

                    const scheduleFields = ['start_date', 'end_date', 'delivery_address']
                    const missingSchedule = scheduleFields.filter(field => {
                        const value = currentData.schedule![field as keyof typeof currentData.schedule]
                        return !isNotEmpty(value)
                    })

                    if (missingSchedule.length > 0) {
                        console.warn("Schedule validation failed - missing:", missingSchedule)
                        for (const field of missingSchedule) {
                            await form.trigger(`schedule.${field}` as any)
                        }
                        return false
                    }

                    const startDate = new Date(currentData.schedule.start_date!)
                    const endDate = new Date(currentData.schedule.end_date!)

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn("Invalid dates detected")
                        return false
                    }

                    if (startDate >= endDate) {
                        console.warn("End date must be after start date")
                        return false
                    }

                    break

                case "personal":
                    if (!currentData.personal_details) {
                        console.warn("Personal details data is missing")
                        return false
                    }

                    const personalFields = ['first_name', 'last_name', 'email', 'phone_number', 'date_of_birth']
                    const missingPersonal = personalFields.filter(field => {
                        const value = currentData.personal_details![field as keyof typeof currentData.personal_details]
                        return !isNotEmpty(value)
                    })

                    if (missingPersonal.length > 0) {
                        console.warn("Personal details validation failed - missing:", missingPersonal)
                        for (const field of missingPersonal) {
                            await form.trigger(`personal_details.${field}` as any)
                        }
                        return false
                    }

                    const email = currentData.personal_details.email
                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        await form.trigger('personal_details.email')
                        return false
                    }

                    const phone = currentData.personal_details.phone_number
                    if (phone && !/^\+63\d{10}$/.test(phone)) {
                        await form.trigger('personal_details.phone_number')
                        return false
                    }

                    break

                case "payment":
                    if (!currentData.payment_method) {
                        console.warn("Payment method data is missing")
                        return false
                    }

                    if (!isNotEmpty(currentData.payment_method.gcash_number)) {
                        console.warn("Payment validation failed - missing GCash number")
                        await form.trigger('payment_method.gcash_number')
                        return false
                    }

                    const gcashNumber = currentData.payment_method.gcash_number
                    if (gcashNumber && !/^\+63\d{10}$/.test(gcashNumber)) {
                        await form.trigger('payment_method.gcash_number')
                        return false
                    }

                    break

                case "summary":
                    if (!currentData.agreements) {
                        console.warn("Agreements data is missing")
                        return false
                    }

                    const agreementFields = ['terms_accepted', 'damage_policy', 'cancellation_policy']
                    const unacceptedAgreements = agreementFields.filter(field => {
                        return currentData.agreements![field as keyof typeof currentData.agreements] !== true
                    })

                    if (unacceptedAgreements.length > 0) {
                        console.warn("Agreements validation failed - unaccepted:", unacceptedAgreements)
                        for (const field of unacceptedAgreements) {
                            await form.trigger(`agreements.${field}` as any)
                        }
                        return false
                    }

                    isValid = await form.trigger()
                    return isValid
            }

            return true
        } catch (error) {
            console.error("Step validation error:", error)
            return false
        }
    }, [form, stepManager.currentStep, isNotEmpty])

    // Navigation handlers
    const handleNext = async () => {
        const isValid = await validateCurrentStep()
        if (!isValid) {
            console.warn("Step validation failed for:", stepManager.currentStep)
            return
        }

        stepManager.markCompleted(stepManager.currentStep)
        stepManager.goToNext()
    }

    const handlePrevious = () => {
        stepManager.goToPrevious()
    }

    // Form submission handler with proper data preparation and validation
    const handleSubmit: SubmitHandler<PartialRentalBookingFormData> = useCallback(async (formData) => {
        try {
            console.log("Form submit handler called with:", formData)

            const submissionData: RentalBookingFormData = {
                costume_id: costumeId || formData.costume_id || "",
                schedule: {
                    start_date: formData.schedule?.start_date || "",
                    end_date: formData.schedule?.end_date || "",
                    delivery_method: formData.schedule?.delivery_method || "delivery",
                    delivery_address: formData.schedule?.delivery_address || "",
                    special_instructions: formData.schedule?.special_instructions || ""
                },
                personal_details: {
                    user_id: user?.id || "",
                    first_name: formData.personal_details?.first_name || "",
                    last_name: formData.personal_details?.last_name || "",
                    email: formData.personal_details?.email || "",
                    phone_number: formData.personal_details?.phone_number || "",
                    date_of_birth: formData.personal_details?.date_of_birth || ""
                },
                payment_method: {
                    type: "gcash",
                    gcash_number: formData.payment_method?.gcash_number || ""
                },
                agreements: {
                    terms_accepted: formData.agreements?.terms_accepted || false,
                    damage_policy: formData.agreements?.damage_policy || false,
                    cancellation_policy: formData.agreements?.cancellation_policy || false
                }
            }

            console.log("Prepared submission data:", submissionData)

            try {
                rentalBookingSchema.parse(submissionData)
            } catch (validationError) {
                console.error("Final validation failed:", validationError)
                throw new Error("Please complete all required fields")
            }

            await submitBooking(submissionData)

        } catch (error) {
            console.error("Form submission error:", error)
            throw error
        }
    }, [costumeId, submitBooking, user?.id])

    // Step content renderer
    const renderStepContent = useCallback((): React.ReactNode => {

        const stepComponents = {
            schedule: <ScheduleForm costumeInfo={costumeInfo} />,
            personal: <PersonalDetailsForm />,
            payment: <PaymentMethodForm />,
            summary: <RentSummary costumeInfo={costumeInfo} />
        }

        return stepComponents[stepManager.currentStep] || null
    }, [stepManager.currentStep, costumeInfo, showPaymentSuccess, rentalResponse, handlePayNow, handleDialogClose])

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-4xl max-h-[98vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                            <Package className="h-6 w-6 text-rose-500" />
                            {showPaymentSuccess ? "Payment Required" : "Rent Costume - Delivery Only"}
                        </DialogTitle>

                    </div>

                    {!showPaymentSuccess && (
                        <div className="space-y-4 mt-4">
                            <Progress value={stepManager.progress} className="h-2" />
                            <StepIndicators steps={stepManager.steps} />
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {renderStepContent()}
                        </form>
                    </FormProvider>
                </div>

                {!showPaymentSuccess && (
                    <div className="flex-shrink-0 border-t pt-4 mt-6">
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={!stepManager.canGoPrevious || isSubmitting}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <Badge variant="secondary" className="text-xs px-3 py-1">
                                Step {stepManager.currentStepIndex + 1} of {stepManager.steps.length}
                            </Badge>

                            {stepManager.isLastStep ? (
                                <Button
                                    type="submit"
                                    onClick={form.handleSubmit(handleSubmit)}
                                    disabled={isSubmitting}
                                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Confirm Booking
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!stepManager.canGoNext || isSubmitting}
                                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Step indicators component
interface StepIndicatorsProps {
    steps: BookingStepConfig[]
}

const StepIndicators: React.FC<StepIndicatorsProps> = ({ steps }) => (
    <div className="flex justify-between">
        {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                        step.isActive
                            ? "bg-rose-500 text-white shadow-lg scale-110"
                            : step.isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                    )}
                >
                    {step.isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="text-center">
                    <div className={cn(
                        "text-sm font-medium transition-colors",
                        step.isActive ? "text-rose-600" : "text-gray-900"
                    )}>
                        {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                </div>
            </div>
        ))}
    </div>
)