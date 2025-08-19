import { z } from "zod"

// Define the add-on schema
const costumeAddOnSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Add-on name is required"),
    description: z.string().min(1, "Add-on description is required"),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Price must be a non-negative number",
    }),
    // File object for image upload
    image: z.any().optional().nullable(),
})

export const COSTUME_TYPE_OPTIONS = [
    { value: "costume_only", label: "Costume Only" },
    { value: "wig_only", label: "Wig Only" },
    { value: "shoes_only", label: "Shoes Only" },
    { value: "props_only", label: "Props Only" },
    { value: "accessories_only", label: "Accessories Only" },
    { value: "full_set_costume_wig", label: "Costume + Wig" },
    { value: "full_set_costume_shoes", label: "Costume + Shoes" },
    { value: "full_set_costume_wig_shoes", label: "Costume + Wig + Shoes" },
    { value: "full_set_costume_props", label: "Costume + Props" },
    { value: "full_set_costume_wig_props", label: "Costume + Wig + Props" },
    { value: "full_set_costume_shoes_props", label: "Costume + Shoes + Props" },
    { value: "full_set_costume_wig_shoes_props", label: "Complete Set" },
    { value: "full_set_wig_shoes", label: "Wig + Shoes" },
    { value: "full_set_wig_props", label: "Wig + Props" },
    { value: "full_set_shoes_props", label: "Shoes + Props" },
    { value: "full_set_wig_shoes_props", label: "Wig + Shoes + Props" },
]

// Define the main costume form schema
export const costumeFormSchema = z
    .object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        brand: z.string().min(1, "Brand is required"),
        gender: z.enum(["male", "female", "unisex"]),
        costumeType: z.enum([
            "costume_only",
            "wig_only",
            "shoes_only",
            "props_only",
            "accessories_only",
            "full_set_costume_wig",
            "full_set_costume_shoes",
            "full_set_costume_wig_shoes",
            "full_set_costume_props",
            "full_set_costume_wig_props",
            "full_set_costume_shoes_props",
            "full_set_costume_wig_shoes_props",
            "full_set_wig_shoes",
            "full_set_wig_props",
            "full_set_shoes_props",
            "full_set_wig_shoes_props",
        ]),
        description: z.string().min(10, "Description must be at least 10 characters"),
        discount: z
            .string()
            .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
                message: "Discount must be between 0 and 100",
            })
            .optional(),
        tags: z.array(z.string()).min(0),
        category: z.string().min(1, "Category is required"),
        listingType: z.union([z.literal("rent"), z.literal("sale"), z.literal("both")]),
        // Security deposit and extended days only required for rent or both
        security_deposit: z
            .string()
            .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
                message: "Security deposit must be a non-negative number",
            })
            .optional(),
        extended_days: z
            .string()
            .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
                message: "Extended days price must be a non-negative number",
            })
            .optional(),
        price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "Price must be a non-negative number",
        }),
        addOns: z.array(costumeAddOnSchema).optional(),
        sizes: z.string().min(1, "Sizes are required"),
        sale_price: z
            .string()
            .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
                message: "Sale price must be a non-negative number",
            })
            .optional(),
    })
    .refine(
        (data) => {
            // Add-ons are only allowed if listingType is 'sale' or 'both'
            if (data.listingType === "rent" && data.addOns && data.addOns.length > 0) {
                return false
            }
            return true
        },
        {
            message: "Add-ons are only allowed for costumes that are for sale",
            path: ["addOns"],
        },
    )
    .refine(
        (data) => {
            // Security deposit is required for rent or both
            if (
                (data.listingType === "rent" || data.listingType === "both") &&
                (!data.security_deposit || data.security_deposit === "")
            ) {
                return false
            }
            return true
        },
        {
            message: "Security deposit is required for rental costumes",
            path: ["security_deposit"],
        },
    )
    .refine(
        (data) => {
            // Extended days price is required for rent or both
            if (
                (data.listingType === "rent" || data.listingType === "both") &&
                (!data.extended_days || data.extended_days === "")
            ) {
                return false
            }
            return true
        },
        {
            message: "Extended days price is required for rental costumes",
            path: ["extended_days"],
        },
    )
    .refine(
        (data) => {
            // Sale price is required for sale or both
            if (
                (data.listingType === "sale" || data.listingType === "both") &&
                (!data.sale_price || data.sale_price === "")
            ) {
                return false
            }
            return true
        },
        {
            message: "Sale price is required for costumes that are for sale",
            path: ["sale_price"],
        },
    )

// Infer the type from the schema
export type CostumeFormValues = z.infer<typeof costumeFormSchema>
export type CostumeAddOn = z.infer<typeof costumeAddOnSchema>