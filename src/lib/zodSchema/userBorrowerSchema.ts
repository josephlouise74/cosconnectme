import { z } from "zod"

export const personalDetailsSchema = z.object({
    first_name: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    middle_name: z.string()
        .max(50, 'Middle name must be less than 50 characters')
        .optional(),
    last_name: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters'),
    email: z.string()
        .email('Please enter a valid email address')
        .min(5, 'Email must be at least 5 characters'),
    phone_number: z.string()
        .min(10, 'Phone number must be at least 10 characters')
        .max(15, 'Phone number must be less than 15 characters')
        .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
    bio: z.string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
    street: z.string()

        .max(100, 'Street must be less than 100 characters')
        .optional(),
    barangay: z.string()

        .optional(),
    zip_code: z.string()
        .max(10, 'Zip code must be less than 10 characters')
        .optional(),
    country: z.string()

        .optional(),
    region: z.string()

        .optional(),
    province: z.string()

        .optional(),
    city: z.object({
        id: z.string(),
        name: z.string()
    }).optional(),
})

export type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>
