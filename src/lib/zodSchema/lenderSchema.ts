// schemas.ts
import { z } from "zod";


export const primaryIdTypes = [
  "NATIONAL_ID", // PhilSys ID
  "PASSPORT",
  "DRIVERS_LICENSE",
  "UMID",
  "SSS_ID",
  "GSIS_ID",
  "PRC_ID",
  "POSTAL_ID",
  "PHILHEALTH_ID",
  "VOTERS_ID",
  "SENIOR_CITIZEN_ID",
  "PWD_ID",
  "INTEGRATED_BAR_ID",
  "OFW_ID"
] as const;

export const secondaryIdTypes = [
  "BARANGAY_ID",
  "POLICE_CLEARANCE",
  "NBI_CLEARANCE",
  "BIRTH_CERTIFICATE",
  "TIN_ID",
  "PAGIBIG_ID",
  "COMPANY_ID",
  "SCHOOL_ID",
  "POSTAL_ID",
  "BRGY_CLEARANCE",
  "CEDULA",
  "INSURANCE_ID",
  "BIR_ID",
  "OWWA_ID",
  "MARINA_ID"
] as const;

export const lenderSignUpSchema = z
  .object({
    businessName: z.string().min(2, "Business name is required").max(50, "Business name must be 50 characters or less"),
    businessType: z.enum(["STORE", "INDIVIDUAL"], {
      required_error: "Please select your business type",
    }),
    // Address fields
    region: z.string().min(1, "Region is required"),
    province: z.string().min(1, "Province is required"),
    city: z.object({
      id: z.string().min(1, "City/Municipality is required"),
      name: z.string().min(1, "City/Municipality name is required")
    }),
    barangay: z.string().min(1, "Barangay is required"),
    zipCode: z.string().min(2, "Zip Code is required"),
    street: z.string().min(5, "Street address is required").max(100, "Street address must be 100 characters or less"),
    businessPhoneNumber: z.string().min(11, "Phone Number must be at least 11 digits"),
    businessEmail: z.string().email("Invalid business email address").min(1, "Business email is required"),
    business_telephone: z.string().optional(),
    hasValidId: z.boolean(),
    validIdType: z.enum(primaryIdTypes, {
      required_error: "Please select valid ID type",
    }).optional(),
    validIdNumber: z.string().optional(),
    validIdFile: z.any().optional(),
    secondaryIdType1: z.enum(secondaryIdTypes, {
      required_error: "Please select secondary ID type",
    }).optional(),
    secondaryIdFile1: z.any().optional(),
    secondaryIdType2: z.enum(secondaryIdTypes, {
      required_error: "Please select secondary ID type",
    }).optional(),
    secondaryIdFile2: z.any().optional(),

    selfieWithId: z.any().optional(),
    businessDescription: z.string().max(500, "Business description must be 500 characters or less").optional(),
    upload_dti_certificate: z.any().optional(),
    upload_business_permit: z.any().optional(),
    upload_storefront_photo: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasValidId) {
      if (!data.validIdType || !data.validIdNumber || !data.validIdFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide all valid ID information",
          path: ["validIdType"],
        });
      }
    } else {
      if (!data.secondaryIdType1 || !data.secondaryIdFile1 || !data.secondaryIdType2 || !data.secondaryIdFile2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide two secondary IDs",
          path: ["secondaryIdType1"],
        });
      }
    }

    // Add validation for business type specific requirements
    if (data.businessType === "INDIVIDUAL" && !data.selfieWithId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selfie with ID is required for individual lenders",
        path: ["selfieWithId"],
      });
    }
    if (data.businessType === "STORE" && (!data.businessDescription || data.businessDescription.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business description is required for store accounts",
        path: ["businessDescription"],
      });
    }
    if (data.businessType === "STORE" && !data.upload_dti_certificate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DTI Certificate is required for registered stores",
        path: ["upload_dti_certificate"],
      });
    }
    if (data.businessType === "STORE" && !data.upload_business_permit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business Permit is required for registered stores",
        path: ["upload_business_permit"],
      });
    }
    if (data.businessType === "STORE" && !data.upload_storefront_photo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Storefront Photo is required for registered stores",
        path: ["upload_storefront_photo"],
      });
    }
  });

export type LenderSignUpFormData = z.infer<typeof lenderSignUpSchema>;