import { z } from 'zod';

export const passwordChangeSchema = z.object({
    currentPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
