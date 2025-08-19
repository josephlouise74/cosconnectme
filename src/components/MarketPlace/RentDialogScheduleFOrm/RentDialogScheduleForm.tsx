"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight, X, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
    BookingStep,
    BookingStepConfig,
    CostumeRentalInfo,
    RentalBookingFormData,
    rentalBookingSchema
} from "./components/type"
import { ScheduleForm } from "./components/ScheduleForm"
import { PersonalDetailsForm } from "./components/Personal-Info"
import { PaymentMethodForm } from "./components/PaymentMethod"
import { RentSummary } from "./components/RentSummary"

// Constants
const STEP_ORDER: readonly BookingStep[] = ["schedule", "personal", "payment", "summary"] as const

const STEP_FIELD_MAP: Record<BookingStep, (keyof RentalBookingFormData)[]> = {
    schedule: ["schedule"],
    personal: ["personalDetails"],
    payment: ["paymentMethod"],
    summary: ["agreements"]
}

const STEP_CONFIG: Record<BookingStep, { title: string; description: string }> = {
    schedule: { title: "Schedule", description: "Select dates & delivery" },
    personal: { title: "Personal Info", description: "Your details" },
    payment: { title: "Payment", description: "Payment method" },
    summary: { title: "Summary", description: "Review & confirm" }
}

// Default form values
const getDefaultFormValues = (): RentalBookingFormData => ({
    schedule: {
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        deliveryMethod: "delivery" as const,
        deliveryAddress: "",
        specialInstructions: ""
    },
    personalDetails: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "+63",
        dateOfBirth: new Date(Date.now() - 19 * 365 * 24 * 60 * 60 * 1000) // 19 years ago
    },
    paymentMethod: {
        type: "gcash",
        gcashNumber: ""
    },
    agreements: {
        termsAccepted: false,
        damagePolicy: false,
        cancellationPolicy: false
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
    onBookingComplete?: (data: RentalBookingFormData) => void,
    onClose?: () => void
) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submitBooking = useCallback(async (data: RentalBookingFormData) => {
        setIsSubmitting(true)

        try {
            console.log("Submitting booking data:", data)

            // Validate against Zod schema
            const validatedData = rentalBookingSchema.parse(data)
            console.log("Schema validation passed:", validatedData)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log("Booking submitted successfully")
            onBookingComplete?.(validatedData)
            onClose?.()

        } catch (error) {
            console.error("Booking submission error:", error)
            throw error // Re-throw to be handled by form
        } finally {
            setIsSubmitting(false)
        }
    }, [onBookingComplete, onClose])

    return { isSubmitting, submitBooking }
}

// Props interface
interface RentalBookingDialogProps {
    isOpen: boolean
    onClose: () => void
    costumeInfo: CostumeRentalInfo
    onBookingComplete?: (bookingData: RentalBookingFormData) => void
}

// Main component
export const RentalBookingDialog: React.FC<RentalBookingDialogProps> = ({
    isOpen,
    onClose,
    costumeInfo,
    onBookingComplete
}) => {
    const stepManager = useStepManager()
    const { isSubmitting, submitBooking } = useFormSubmission(onBookingComplete, onClose)

    const form = useForm<RentalBookingFormData>({
        resolver: zodResolver(rentalBookingSchema as any),
        defaultValues: getDefaultFormValues(),
        mode: "onChange"
    })

    // Step validation
    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        const fieldsToValidate = STEP_FIELD_MAP[stepManager.currentStep]
        return await form.trigger(fieldsToValidate)
    }, [form, stepManager.currentStep])

    // Navigation handlers
    const handleNext = useCallback(async () => {
        const isValid = await validateCurrentStep()
        if (!isValid) {
            console.warn("Step validation failed for:", stepManager.currentStep)
            return
        }

        stepManager.markCompleted(stepManager.currentStep)
        stepManager.goToNext()
    }, [validateCurrentStep, stepManager])

    const handlePrevious = useCallback(() => {
        stepManager.goToPrevious()
    }, [stepManager])

    // Form submission
    const handleSubmit: SubmitHandler<RentalBookingFormData> = useCallback(async (data) => {
        // Final validation
        const isValid = await form.trigger()
        if (!isValid) {
            console.log("Final form validation failed")
            return
        }

        try {
            await submitBooking(data)
        } catch (error) {
            // Handle Zod validation errors
            if (error && typeof error === "object" && "issues" in error) {
                const zodError = error as any
                zodError.issues?.forEach((issue: any) => {
                    const fieldPath = issue.path.join(".")
                    form.setError(fieldPath as any, {
                        type: "manual",
                        message: issue.message
                    })
                })
            }
        }
    }, [form, submitBooking])

    // Step content renderer
    const renderStepContent = useCallback((): React.ReactNode => {
        const stepComponents = {
            schedule: <ScheduleForm costumeInfo={costumeInfo} />,
            personal: <PersonalDetailsForm />,
            payment: <PaymentMethodForm />,
            summary: <RentSummary costumeInfo={costumeInfo} />
        }

        return stepComponents[stepManager.currentStep] || null
    }, [stepManager.currentStep, costumeInfo])

    const handleDialogClose = useCallback(() => {
        if (!isSubmitting) {
            onClose()
        }
    }, [isSubmitting, onClose])

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                            <Package className="h-6 w-6 text-rose-500" />
                            Rent Costume - Delivery Only
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDialogClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-4 mt-4">
                        <Progress value={stepManager.progress} className="h-2" />
                        <StepIndicators steps={stepManager.steps} />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <Package className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 font-medium">
                            All rentals include free delivery to your specified address
                        </AlertDescription>
                    </Alert>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {renderStepContent()}
                        </form>
                    </FormProvider>
                </div>

                <DialogFooter
                    currentStepIndex={stepManager.currentStepIndex}
                    totalSteps={stepManager.steps.length}
                    canGoPrevious={stepManager.canGoPrevious}
                    canGoNext={stepManager.canGoNext}
                    isLastStep={stepManager.isLastStep}
                    isSubmitting={isSubmitting}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={form.handleSubmit(handleSubmit)}
                />
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

// Dialog footer component
interface DialogFooterProps {
    currentStepIndex: number
    totalSteps: number
    canGoPrevious: boolean
    canGoNext: boolean
    isLastStep: boolean
    isSubmitting: boolean
    onPrevious: () => void
    onNext: () => void
    onSubmit: () => void
}

const DialogFooter: React.FC<DialogFooterProps> = ({
    currentStepIndex,
    totalSteps,
    canGoPrevious,
    canGoNext,
    isLastStep,
    isSubmitting,
    onPrevious,
    onNext,
    onSubmit
}) => (
    <div className="flex-shrink-0 border-t pt-4 mt-6">
        <div className="flex justify-between items-center">
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoPrevious || isSubmitting}
                className="flex items-center gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            <Badge variant="secondary" className="text-xs px-3 py-1">
                Step {currentStepIndex + 1} of {totalSteps}
            </Badge>

            {isLastStep ? (
                <Button
                    type="submit"
                    onClick={onSubmit}
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
                    onClick={onNext}
                    disabled={!canGoNext || isSubmitting}
                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    </div>
)