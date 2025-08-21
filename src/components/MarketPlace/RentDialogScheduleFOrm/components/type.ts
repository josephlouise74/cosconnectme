import { z } from "zod"

// Schema definitions with proper validation
export const scheduleSchema = z.object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    delivery_method: z.enum(["delivery", "pickup"]).default("delivery"),
    delivery_address: z.string().min(1, "Delivery address is required"),
    special_instructions: z.string().optional().default(""),
})

export const personalDetailsSchema = z.object({
    first_name: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
    user_id: z.string().min(1, "User ID is required"),
    last_name: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone_number: z.string().min(1, "Phone number is required").regex(/^\+63\d{10}$/, "Please enter a valid Philippine phone number"),
    date_of_birth: z.string().min(1, "Date of birth is required").refine((date) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18
        }
        return age >= 18
    }, "You must be at least 18 years old"),
})

export const paymentMethodSchema = z.object({
    type: z.enum(["gcash"]).default("gcash"),
    gcash_number: z.string().optional()
})

export const agreementsSchema = z.object({
    terms_accepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    damage_policy: z.boolean().refine(val => val === true, "You must accept the damage policy"),
    cancellation_policy: z.boolean().refine(val => val === true, "You must accept the cancellation policy"),
})

// Main schema - all fields are required for final submission
export const rentalBookingSchema = z.object({
    costume_id: z.string().min(1, "Costume ID is required"),
    schedule: scheduleSchema,
    personal_details: personalDetailsSchema,
    payment_method: paymentMethodSchema,
    agreements: agreementsSchema,
})

// Partial schema for step-by-step validation (optional fields for intermediate steps)
export const partialRentalBookingSchema = z.object({
    costume_id: z.string().optional(),
    schedule: scheduleSchema.partial().optional(),
    personal_details: personalDetailsSchema.partial().optional(),
    payment_method: paymentMethodSchema.partial().optional(),
    agreements: agreementsSchema.partial().optional(),
})

// Type exports
export type ScheduleData = z.infer<typeof scheduleSchema>
export type PersonalDetailsData = z.infer<typeof personalDetailsSchema>
export type PaymentMethodData = z.infer<typeof paymentMethodSchema>
export type AgreementsData = z.infer<typeof agreementsSchema>
export type RentalBookingFormData = z.infer<typeof rentalBookingSchema>
export type PartialRentalBookingFormData = z.infer<typeof partialRentalBookingSchema>

// Type for booking steps
export type BookingStep = "schedule" | "personal" | "payment" | "summary"
// Interface for booking step configuration
// Additional types for step configuration
export interface BookingStepConfig {
    id: BookingStep
    title: string
    description: string
    isCompleted: boolean
    isActive: boolean
}

export interface CostumeRentalInfo {
    id: string
    name: string
    price: number
    image?: string
    description?: string
    category?: string
    size?: string
    [key: string]: any
}


export interface RentalCalculation {
    dailyRate: number
    numberOfDays: number
    subtotal: number
    securityDeposit: number
    tax: number
    total: number
}
