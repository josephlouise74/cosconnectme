

// Helper validators
const phoneRegex = /^\+?[1-9]\d{1,14}$/ // E.164 format
const cardNumberRegex = /^\d{13,19}$/
const expiryDateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
const cvvRegex = /^\d{3,4}$/
const MINIMUM_AGE = 18

// Helper function to calculate age
const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

// Base schemas
const scheduleBase = {
    startDate: z.date().min(new Date(), { message: "Start date must be in the future" }),
    endDate: z.date(),
}

const personalDetailsBase = {
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name is too long")
        .regex(/^[a-zA-Z\s-']+$/, "First name contains invalid characters"),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name is too long")
        .regex(/^[a-zA-Z\s-']+$/, "Last name contains invalid characters"),

    email: z
        .string()
        .email("Please enter a valid email address")
        .max(100, "Email is too long")
        .transform((val) => val.trim().toLowerCase()),

    phoneNumber: z
        .string()
        .min(10, "Phone number is too short")
        .max(15, "Phone number is too long")
        .regex(phoneRegex, "Please enter a valid phone number (e.g., +639123456789)")
        .transform((val) => val.replace(/[^\d+]/g, "")), // Keep only digits and +

    dateOfBirth: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z
            .date()
            .refine((date) => calculateAge(date) >= MINIMUM_AGE, {
                message: `You must be at least ${MINIMUM_AGE} years old to rent`,
            })
            .refine((date) => date < new Date(), {
                message: "Date of birth cannot be in the future",
            }),
    ),
}

// Main schema with refined validation
import { z } from "zod"

export const rentalBookingSchema = z.object({
    schedule: z
        .object({
            startDate: z.date(),
            endDate: z.date(),
            deliveryMethod: z.literal("delivery").default("delivery"),
            deliveryAddress: z.string().min(10, "Please provide a complete delivery address").max(500, "Address is too long"),
            specialInstructions: z.string().max(1000, "Instructions are too long").optional(),
        })
        .refine((data) => data.endDate >= data.startDate, {
            message: "End date must be after start date",
            path: ["endDate"],
        }),

    personalDetails: z.object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name is too long")
            .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name is too long")
            .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
        email: z
            .string()
            .email("Please enter a valid email address")
            .min(5, "Email is too short")
            .max(100, "Email is too long"),
        phoneNumber: z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number is too long")
            .regex(/^[+]?[0-9\s\-()]+$/, "Please enter a valid phone number"),
        dateOfBirth: z
            .date()
            .refine(
                (date) => {
                    const today = new Date()
                    const age = today.getFullYear() - date.getFullYear()
                    return age >= 18 && age <= 100
                },
                {
                    message: "You must be at least 18 years old",
                },
            ),
    }),

    paymentMethod: z.object({
        type: z
            .enum(["gcash"],)
            .default("gcash"),
        gcashNumber: z
            .string()
            .min(11, "GCash number must be at least 11 digits")
            .max(13, "GCash number is too long")
            .regex(/^[+]?[0-9]+$/, "Please enter a valid GCash number"),
    }),

    agreements: z.object({
        termsAccepted: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions",
        }),
        damagePolicy: z.boolean().refine((val) => val === true, {
            message: "You must accept the damage policy",
        }),
        cancellationPolicy: z.boolean().refine((val) => val === true, {
            message: "You must accept the cancellation policy",
        }),
    }),
})



// Types
export type RentalBookingFormData = z.infer<typeof rentalBookingSchema>

export interface CostumeRentalInfo {
    id: string
    name: string
    brand: string
    category: string
    size: string
    dailyRate: number
    securityDeposit: number
    images: {
        main: {
            front: string
            back: string
        }
        additional?: Array<{
            url: string
            alt_text: string
        }>
    }
    unavailableDates: Date[]
    minRentalDays: number
    maxRentalDays: number
}

export type BookingStep = "schedule" | "personal" | "payment" | "summary"

export interface BookingStepConfig {
    id: BookingStep
    title: string
    description: string
    isCompleted: boolean
    isActive: boolean
}

export interface RentalCalculation {
    dailyRate: number
    numberOfDays: number
    subtotal: number
    securityDeposit: number
    tax: number
    total: number
}
