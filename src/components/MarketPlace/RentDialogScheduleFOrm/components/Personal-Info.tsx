"use client"

import type React from "react"
import { useFormContext } from "react-hook-form"
import { User, Phone, Mail, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const PersonalDetailsForm: React.FC = () => {
    const {
        control,
        formState: { errors },
    } = useFormContext()

    const formatDateForInput = (date: Date | undefined): string => {
        if (!date) return ""
        return date.toISOString().split("T")[0] as any
    }

    const handleDateChange = (dateString: string, onChange: (date: Date) => void) => {
        if (dateString) {
            const date = new Date(dateString)
            // Ensure the date is valid
            if (!isNaN(date.getTime())) {
                onChange(date)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                <p className="text-gray-600">We need some details to process your rental</p>
            </div>

            {Object.keys(errors.personalDetails || {}).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please correct the errors below to continue.</AlertDescription>
                </Alert>
            )}

            {/* Personal Information */}
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
                            name="personalDetails.firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your first name"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.trim())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="personalDetails.lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your last name"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.trim())}
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
                            name="personalDetails.email"
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
                                            onChange={(e) => field.onChange(e.target.value.trim().toLowerCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="personalDetails.phoneNumber"
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
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d+\-\s()]/g, "")
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="personalDetails.dateOfBirth"
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
                                        onChange={(e) => handleDateChange(e.target.value, field.onChange)}
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
