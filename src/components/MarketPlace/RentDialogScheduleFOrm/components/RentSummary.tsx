"use client"

import React from "react"

import { useFormContext } from "react-hook-form"
import { Check, Calendar, MapPin, User, CreditCard, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { CostumeRentalInfo, RentalBookingFormData } from "./type"

interface RentSummaryProps {
    costumeInfo: CostumeRentalInfo
}

export const RentSummary: React.FC<RentSummaryProps> = ({ costumeInfo }) => {
    const { control, watch } = useFormContext<RentalBookingFormData>()

    const formData = watch()
    const startDate = formData.schedule?.startDate
    const endDate = formData.schedule?.endDate

    const rentalInfo = React.useMemo(() => {
        if (!startDate || !endDate) return null

        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const subtotal = days * costumeInfo.dailyRate

        return {
            days,
            subtotal,
            total: subtotal + costumeInfo.securityDeposit,
        }
    }, [startDate, endDate, costumeInfo.dailyRate, costumeInfo.securityDeposit])

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Booking Summary</h2>
                <p className="text-gray-600">Review your rental details before confirming</p>
            </div>

            {/* Costume Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Costume Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <img
                            src={costumeInfo.images.main.front || "/placeholder.svg"}
                            alt={costumeInfo.name}
                            className="w-20 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{costumeInfo.name}</h3>
                            <p className="text-gray-600">by {costumeInfo.brand}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{costumeInfo.category}</Badge>
                                <Badge variant="outline">Size {costumeInfo.size}</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rental Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-rose-500" />
                        Rental Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{startDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{endDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                            {rentalInfo?.days} day{rentalInfo?.days !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Method:</span>
                        <span className="font-medium text-green-600 flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            Delivery Only
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-rose-500" />
                        Delivery Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-800">{formData.schedule?.deliveryAddress}</p>
                    {formData.schedule?.specialInstructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Special Instructions:</strong> {formData.schedule.specialInstructions}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Personal Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-rose-500" />
                        Renter Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                            {formData.personalDetails?.firstName} {formData.personalDetails?.lastName}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.personalDetails?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{formData.personalDetails?.phoneNumber}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-rose-500" />
                        Payment Method
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment Type:</span>
                        <span className="font-medium">GCash</span>
                    </div>
                    {formData.paymentMethod?.gcashNumber && (
                        <div className="flex justify-between mt-2">
                            <span className="text-gray-600">GCash Number:</span>
                            <span className="font-medium">{formData.paymentMethod.gcashNumber}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            {rentalInfo && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardHeader>
                        <CardTitle className="text-rose-800">Pricing Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>
                                    Rental ({rentalInfo.days} day{rentalInfo.days !== 1 ? "s" : ""})
                                </span>
                                <span>₱{rentalInfo.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Security Deposit</span>
                                <span>₱{costumeInfo.securityDeposit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery</span>
                                <span className="text-green-600 font-medium">Included</span>
                            </div>
                            <hr className="border-rose-200" />
                            <div className="flex justify-between font-semibold text-rose-800 text-base">
                                <span>Total</span>
                                <span>₱{rentalInfo.total}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Terms and Agreements */}
            <Card>
                <CardHeader>
                    <CardTitle>Terms and Agreements</CardTitle>
                    <CardDescription>Please review and accept our policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={control}
                        name="agreements.termsAccepted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I accept the Terms and Conditions</FormLabel>
                                    <p className="text-sm text-gray-600">
                                        By checking this box, you agree to our rental terms and conditions.
                                    </p>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="agreements.damagePolicy"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I acknowledge the Damage Policy</FormLabel>
                                    <p className="text-sm text-gray-600">
                                        I understand that I am responsible for any damage to the costume during the rental period.
                                    </p>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="agreements.cancellationPolicy"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I acknowledge the Cancellation Policy</FormLabel>
                                    <p className="text-sm text-gray-600">
                                        I understand the cancellation terms and refund policy for this rental.
                                    </p>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
