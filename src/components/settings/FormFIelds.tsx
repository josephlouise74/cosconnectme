// components/FormFields.tsx
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LenderSignUpFormData } from "@/lib/zodSchema/lenderSchema";
import { LucideIcon } from "lucide-react";
import { Control } from "react-hook-form";


interface IconInputFieldProps {
    control: Control<LenderSignUpFormData>;
    name: keyof LenderSignUpFormData;
    label: string;
    placeholder?: string;
    type?: string;
    icon?: LucideIcon;
    fieldType?: "text" | "zipcode" | "username" | "businessPhoneNumber" | "business_telephone" | "validIdNumber" | "businessPermitNumber";
    maxLength?: number;
    disabled?: boolean;
}

export const IconInputField = ({
    control,
    name,
    label,
    placeholder,
    type = "text",
    icon: Icon,
    fieldType = "text",
    maxLength,
    disabled = false,
}: IconInputFieldProps) => {
    // Format phone number with +63 prefix
    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters except + and space
        const cleaned = value.replace(/[^\d+\s]/g, '');

        // If the input doesn't start with +63, add it
        if (!cleaned.startsWith("+63")) {
            return "+63 ";
        }

        // Handle the case where the user is deleting characters but preserve the +63 prefix
        if (cleaned === "+63") {
            return "+63 ";
        }

        // Ensure there's a space after the +63 prefix
        if (cleaned.startsWith("+63") && cleaned.length > 3 && cleaned[3] !== " ") {
            return "+63 " + cleaned.substring(3);
        }

        // For user input after the +63 prefix
        if (cleaned.startsWith("+63 ")) {
            const numbers = cleaned.substring(4).replace(/\D/g, "");

            if (numbers.length === 0) return "+63 ";

            // Format as +63 9XX XXX XXXX
            if (numbers.length <= 3) return `+63 ${numbers}`;
            if (numbers.length <= 6) return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3)}`;
            if (numbers.length <= 9) return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
            return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
        }

        return value;
    };


    // Format zip code as xxxxx or xxxxx-xxxx
    const formatZipCode = (value: string) => {
        // Remove all non-digit characters
        const numbers = value.replace(/\D/g, "");

        // Format as xxxxx or xxxxx-xxxx
        if (numbers.length <= 5) return numbers;
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 9)}`;
    };


    const formatValidIdNumber = (value: string) => {
        // Remove all non-digit characters
        const numbers = value.replace(/\D/g, "");
        return numbers;
    };

    const formatBusinessPermitNumber = (value: string) => {
        // Remove all non-digit characters
        const numbers = value.replace(/\D/g, "");
        return numbers;
    };

    // Format business telephone - only numbers, no prefix
    const formatBusinessTelephone = (value: string) => {
        // Remove all non-digit characters
        const numbers = value.replace(/\D/g, "");
        return numbers;
    };

    // Handle validation and formatting based on field type
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
        let value = e.target.value;

        if (fieldType === "businessPhoneNumber") {
            value = formatPhoneNumber(value);
        } else if (fieldType === "business_telephone") {
            value = formatBusinessTelephone(value);
        } else if (fieldType === "zipcode") {
            value = formatZipCode(value);
        } else if (fieldType === "validIdNumber") {
            value = formatValidIdNumber(value);
        } else if (fieldType === "businessPermitNumber") {
            value = formatBusinessPermitNumber(value);
        }
        onChange(value);
    };

    // Handle keypress for specific fields
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (fieldType === "businessPhoneNumber") {
            // For phone field, prevent deleting the +63 prefix
            if ((e.key === "Backspace" || e.key === "Delete") &&
                (e.currentTarget.selectionStart || 0) <= 4 &&
                (e.currentTarget.selectionEnd || 0) <= 4) {
                e.preventDefault();
                return;
            }

            // Allow only numbers, backspace, delete, arrows, tab for the rest
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
            const isNumeric = /^[0-9\b]+$/.test(e.key);

            if (!isNumeric && !allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        } else if (fieldType === "business_telephone" || fieldType === "zipcode" || fieldType === "validIdNumber" || fieldType === "businessPermitNumber") {
            // Allow only numbers, backspace, delete, arrows, tab
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
            const isNumeric = /^[0-9\b]+$/.test(e.key);

            if (!isNumeric && !allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value, onChange, onBlur, ...fieldProps } }) => {
                // For phone numbers, ensure the value has the correct prefix
                if (fieldType === "businessPhoneNumber" && name === "businessPhoneNumber") {
                    // Initialize with +63 space if empty
                    if (!value || value === "") {
                        value = "+63 ";
                    }
                    // Ensure there's a space after +63
                    else if (value === "+63") {
                        value = "+63 ";
                    }
                    // Add space if missing
                    else if (value.startsWith("+63") && value.length > 3 && value[3] !== " ") {
                        value = "+63 " + value.substring(3);
                    }
                }
                // For zip code, ensure proper formatting
                else if (fieldType === "zipcode" && name === "zipCode" && value) {
                    value = formatZipCode(value);
                }

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                {Icon && (
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                )}
                                <Input
                                    {...fieldProps}
                                    name={String(fieldProps.name)}
                                    value={value ?? ""}
                                    onChange={(e) => handleInputChange(e, onChange)}
                                    onKeyDown={handleKeyPress}
                                    onBlur={(e) => {
                                        // Ensure +63 space is maintained on blur
                                        if (fieldType === "businessPhoneNumber" && name === "businessPhoneNumber") {
                                            const currentValue = e.target.value;
                                            if (!currentValue || currentValue === "") {
                                                onChange("+63 ");
                                            } else if (currentValue === "+63") {
                                                onChange("+63 ");
                                            }
                                        }
                                        // For zip code, ensure proper formatting on blur
                                        else if (fieldType === "zipcode" && name === "zipCode") {
                                            onChange(formatZipCode(e.target.value));
                                        }
                                        onBlur();
                                    }}
                                    type={type}
                                    placeholder={placeholder}
                                    className={`${Icon ? "pl-10" : ""} w-full`}
                                    aria-label={label}
                                    maxLength={
                                        maxLength ||
                                        (fieldType === "businessPhoneNumber" ? 20 :
                                            fieldType === "business_telephone" ? 15 :
                                                fieldType === "zipcode" ? 10 :
                                                    fieldType === "validIdNumber" || fieldType === "businessPermitNumber" ? 35 : undefined)
                                    }
                                    inputMode={
                                        fieldType === "businessPhoneNumber" || fieldType === "business_telephone" || fieldType === "zipcode" || fieldType === "validIdNumber" || fieldType === "businessPermitNumber" ? "numeric" : undefined
                                    }
                                    disabled={disabled}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

interface FileUploadFieldProps {
    control: Control<LenderSignUpFormData>;
    name: keyof LenderSignUpFormData;
    label: string;
    description?: string;
    required?: boolean;
}

export const FileUploadField = ({
    control,
    name,
    label,
    description,
    required = true,
}: FileUploadFieldProps) => (
    <FormField
        control={control}
        name={name}
        render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
                <FormLabel>{label}{required ? "" : " (Optional)"}</FormLabel>
                <FormControl>
                    <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files as any)}
                        {...field}
                        name={String(field.name)}
                    />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
);

interface TelephoneInputFieldProps {
    control: Control<LenderSignUpFormData>;
    name: keyof LenderSignUpFormData;
    label: string;
    placeholder?: string;
    icon?: LucideIcon;
}

export const TelephoneInputField = ({
    control,
    name,
    label,
    placeholder,
    icon: Icon,
}: TelephoneInputFieldProps) => {
    // Format phone number with +63 prefix
    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters except + and space
        const cleaned = value.replace(/[^\d+\s]/g, '');

        // If the input doesn't start with +63, add it
        if (!cleaned.startsWith("+63")) {
            return "+63 ";
        }

        // Handle the case where the user is deleting characters but preserve the +63 prefix
        if (cleaned === "+63") {
            return "+63 ";
        }

        // Ensure there's a space after the +63 prefix
        if (cleaned.startsWith("+63") && cleaned.length > 3 && cleaned[3] !== " ") {
            return "+63 " + cleaned.substring(3);
        }

        // For user input after the +63 prefix
        if (cleaned.startsWith("+63 ")) {
            const numbers = cleaned.substring(4).replace(/\D/g, "");

            if (numbers.length === 0) return "+63 ";

            // Format as +63 9XX XXX XXXX
            if (numbers.length <= 3) return `+63 ${numbers}`;
            if (numbers.length <= 6) return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3)}`;
            if (numbers.length <= 9) return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
            return `+63 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
        }

        return value;
    };

    // Handle validation and formatting
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
        const value = formatPhoneNumber(e.target.value);
        onChange(value);
    };

    // Handle keypress for telephone field
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // For phone field, prevent deleting the +63 prefix
        if ((e.key === "Backspace" || e.key === "Delete") &&
            (e.currentTarget.selectionStart || 0) <= 4 &&
            (e.currentTarget.selectionEnd || 0) <= 4) {
            e.preventDefault();
            return;
        }

        // Allow only numbers, backspace, delete, arrows, tab for the rest
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
        const isNumeric = /^[0-9\b]+$/.test(e.key);

        if (!isNumeric && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value, onChange, onBlur, ...fieldProps } }) => {
                // Ensure the value has the correct prefix
                if (!value || value === "") {
                    value = "+63 ";
                }
                // Ensure there's a space after +63
                else if (value === "+63") {
                    value = "+63 ";
                }
                // Add space if missing
                else if (value.startsWith("+63") && value.length > 3 && value[3] !== " ") {
                    value = "+63 " + value.substring(3);
                }

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                {Icon && (
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                )}
                                <Input
                                    {...fieldProps}
                                    name={String(fieldProps.name)}
                                    value={value ?? ""}
                                    onChange={(e) => handleInputChange(e, onChange)}
                                    onKeyDown={handleKeyPress}
                                    onBlur={(e) => {
                                        // Ensure +63 space is maintained on blur
                                        const currentValue = e.target.value;
                                        if (!currentValue || currentValue === "") {
                                            onChange("+63 ");
                                        } else if (currentValue === "+63") {
                                            onChange("+63 ");
                                        }
                                        onBlur();
                                    }}
                                    type="tel"
                                    placeholder={placeholder}
                                    className={`${Icon ? "pl-10" : ""} w-full`}
                                    aria-label={label}
                                    maxLength={20}
                                    inputMode="numeric"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};