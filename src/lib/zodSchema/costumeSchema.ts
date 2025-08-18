import { z } from "zod";

// 🔹 Enums
export const GenderEnum = z.enum(["male", "female", "unisex"]);
export const ListingTypeEnum = z.enum(["rent", "sale", "both"]);

// 🔹 Add-on Schema
export const CostumeAddOnSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Add-on name is required"),
    description: z.string().min(1, "Add-on description is required"),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Price must be a non-negative number",
    }),
    image: z.string().optional(),
});

// 🔹 Lender User Schema
export const LenderUserSchema = z.object({
    uid: z.string().min(1, "UID is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
});

// 🔹 Costume Type Schema
export const CostumeTypeSchema = z.object({
    type: z.string().min(1, "Costume type is required"),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Price must be a non-negative number",
    }),
});

// 🔹 Main Offer Schema
export const MainOfferSchema = z.object({
    type: z.string().min(1, "Offer type is required"),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Price must be a non-negative number",
    }),
});

// 🔹 Costume Schema
export const CostumeSchema = z.object({
    name: z.string().min(1, "Costume name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    brand: z.string().min(1, "Brand is required"),
    sizes: z.string().min(1, "Size is required"),
    gender: GenderEnum,
    tags: z.array(z.string()).optional().default([]),
    extended_days: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Extended days must be a non-negative number",
    }),
    discount: z.string().optional(),
    security_deposit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Security deposit must be a non-negative number",
    }),
    sale_price: z.string().optional(),
    listingType: ListingTypeEnum,
    selectedCostumeType: z.string().min(1, "Selected costume type is required"),
    mainImages: z.object({
        front: z.string().url("Invalid front image URL"),
        back: z.string().url("Invalid back image URL"),
    }),
    additionalImages: z.array(
        z.object({
            url: z.string().url("Invalid image URL"),
            order: z.number().int().min(0),
        })
    ).optional().default([]),
    lenderUser: LenderUserSchema,
    addOns: z.array(CostumeAddOnSchema).optional().default([]),
    costumeType: z.array(CostumeTypeSchema).min(1, "At least one costume type is required"),
    mainOffer: MainOfferSchema,
});

// 🔹 Types
export type CostumeValues = z.infer<typeof CostumeSchema>;
export type CostumeAddOn = z.infer<typeof CostumeAddOnSchema>;
export type CostumeType = z.infer<typeof CostumeTypeSchema>;
export type LenderUser = z.infer<typeof LenderUserSchema>;
export type MainOffer = z.infer<typeof MainOfferSchema>;
