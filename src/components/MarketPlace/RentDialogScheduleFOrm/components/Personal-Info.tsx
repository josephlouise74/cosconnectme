"use client"
import type React from "react"
import { useFormContext } from "react-hook-form"
import { User, Phone, Mail, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect } from "react"
import type { RentalBookingFormData } from "./type"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"

export const PersonalDetailsForm: React.FC = () => {
    const {
        control,
        formState: { errors },
        watch,
        trigger,
        getValues,
        setValue
    } = useFormContext<RentalBookingFormData>()

    const { userData } = useSupabaseAuth()

    // Set default values from userData when component mounts
    useEffect(() => {
        if (userData) {
            // Set email from userData
            setValue("personal_details.email", userData.email || "");

            // Set name fields if available
            if (userData.personal_info) {
                setValue("personal_details.first_name", userData.personal_info.first_name || "");
                setValue("personal_details.last_name", userData.personal_info.last_name || "");

                // Set phone number if available
                if (userData.personal_info.phone_number) {
                    setValue("personal_details.phone_number", userData.personal_info.phone_number);
                }


            }
        }
    }, [userData, setValue]);

    // Watch all personal details fields
    const personalDetails = watch("personal_details")

    // Debug: Log current form values
    useEffect(() => {
        console.log("Personal Details Form - Current values:", personalDetails)
        console.log("Personal Details Form - All form values:", getValues())
        console.log("Personal Details Form - Errors:", errors.personal_details)
    }, [personalDetails, errors.personal_details, getValues])

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString: string | undefined): string => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ""
            return date.toISOString().split("T")[0] as any
        } catch (error) {
            console.error("Invalid date string:", dateString)
            return ""
        }
    }

    // Handle date change with validation
    const handleDateChange = (dateString: string, field: any) => {
        if (dateString) {
            const date = new Date(dateString)
            if (!isNaN(date.getTime())) {
                field.onChange(date.toISOString())
                // Trigger validation after setting the date
                setTimeout(() => {
                    trigger("personal_details.date_of_birth")
                }, 100)
            }
        } else {
            field.onChange("")
        }
    }

    // Format phone number as user types
    const formatPhoneNumber = (value: string) => {
        if (!value) return "+63"
        // Remove all non-digits except the leading +
        let cleaned = value.replace(/[^\d+]/g, "")
        // Ensure it starts with +63
        if (!cleaned.startsWith("+63")) {
            if (cleaned.startsWith("63")) {
                cleaned = "+" + cleaned
            } else if (cleaned.startsWith("0")) {
                cleaned = "+63" + cleaned.substring(1)
            } else if (cleaned.match(/^\d/)) {
                cleaned = "+63" + cleaned
            } else {
                cleaned = "+63"
            }
        }
        // Limit to +63 plus 10 digits
        if (cleaned.length > 13) {
            cleaned = cleaned.substring(0, 13)
        }
        // Format display: +63 XXX XXX XXXX
        const match = cleaned.match(/^\+63(\d{0,3})(\d{0,3})(\d{0,4})/)
        if (!match) return "+63"
        const [, part1, part2, part3] = match
        if (part3) return `+63 ${part1} ${part2} ${part3}`
        if (part2) return `+63 ${part1} ${part2}`
        if (part1) return `+63 ${part1}`
        return "+63"
    }

    // Get the raw phone number without formatting for storage
    const getRawPhoneNumber = (formattedValue: string): string => {
        return formattedValue.replace(/\s/g, "")
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                <p className="text-gray-600">We need some details to process your rental</p>
            </div>

            {Object.keys(errors.personal_details || {}).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please correct the errors below to continue.</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-rose-500" />
                        Your Details
                    </CardTitle>
                    <CardDescription>Basic information for your rental agreement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="personal_details.first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your first name"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => {
                                                const value = e.target.value.trimStart()
                                                field.onChange(value)
                                                // Trigger validation for this field
                                                trigger("personal_details.first_name")
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="personal_details.last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your last name"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => {
                                                const value = e.target.value.trimStart()
                                                field.onChange(value)
                                                // Trigger validation for this field
                                                trigger("personal_details.last_name")
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="personal_details.email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Address *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={true} // Make email field disabled
                                            className="bg-gray-50 cursor-not-allowed" // Visual indication that it's disabled
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="personal_details.phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone Number *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="+63 912 345 6789"
                                            value={formatPhoneNumber(field.value || "")}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value)
                                                const raw = getRawPhoneNumber(formatted)
                                                field.onChange(raw)
                                                // Trigger validation for this field
                                                trigger("personal_details.phone_number")
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-gray-500">Format: +63 912 345 6789</p>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={control}
                        name="personal_details.date_of_birth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date of Birth *
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={formatDateForInput(field.value)}
                                        onChange={(e) => handleDateChange(e.target.value, field)}
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                                    />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-gray-500 mt-1">You must be at least 18 years old to rent costumes</p>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>


        </div>
    )
}