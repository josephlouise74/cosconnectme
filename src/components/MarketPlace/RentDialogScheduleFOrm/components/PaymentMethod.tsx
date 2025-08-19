"use client"

import type React from "react"
import { useFormContext } from "react-hook-form"
import { Smartphone, Shield, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export const PaymentMethodForm: React.FC = () => {
    const { control } = useFormContext()

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>
                <p className="text-gray-600">Secure payment with GCash</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        GCash Payment
                    </CardTitle>
                    <CardDescription>Pay securely with your GCash account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                        <div className="flex-1">
                            <div className="font-medium text-blue-900">GCash - Digital Wallet</div>
                            <div className="text-sm text-blue-700">Fast, secure, and convenient payment</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>

                    <FormField
                        control={control}
                        name="paymentMethod.gcashNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GCash Mobile Number</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="+63 912 345 6789" {...field} className="text-lg" />
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-gray-500 mt-1">Enter the mobile number linked to your GCash account</p>
                            </FormItem>
                        )}
                    />

                    <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            How it works
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                    1
                                </span>
                                <span>You'll receive a GCash payment request after booking confirmation</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                    2
                                </span>
                                <span>Open your GCash app and approve the payment</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                    3
                                </span>
                                <span>Your costume will be prepared for delivery once payment is confirmed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                    All GCash transactions are protected with bank-level security and encryption.
                </p>
            </div>
        </div>
    )
}
