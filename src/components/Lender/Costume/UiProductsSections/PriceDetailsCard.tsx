import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { CostumeFormValues } from '@/lib/zodSchema/costumeSchema';

// Costume type options from your schema
const COSTUME_TYPE_OPTIONS = [
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
];

export const RentPriceDetailsCard: React.FC = () => {
    const form = useFormContext<CostumeFormValues>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rental Pricing Details</CardTitle>
                <CardDescription>
                    Set your rental prices and costume type information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Costume Type Selection */}
                <FormField
                    control={form.control}
                    name="costumeType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Costume Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select costume type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {COSTUME_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Daily Rental Price */}
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Daily Rental Price (₱) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Security Deposit */}
                    <FormField
                        control={form.control}
                        name="security_deposit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Security Deposit (₱) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Extended Days Fee */}
                    <FormField
                        control={form.control}
                        name="extended_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Extended Days Fee (₱/day) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Discount Percentage */}
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="0"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Rental Pricing Information:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Daily rental price is charged per day of rental</li>
                        <li>• Security deposit is refundable upon return in good condition</li>
                        <li>• Extended days fee applies for late returns</li>
                        <li>• Discount is optional and reduces the daily rental price</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export const SalePriceDetailsCard: React.FC = () => {
    const form = useFormContext<CostumeFormValues>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sale Pricing Details</CardTitle>
                <CardDescription>
                    Set your sale price and costume type information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Costume Type Selection */}
                <FormField
                    control={form.control}
                    name="costumeType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Costume Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select costume type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {COSTUME_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sale Price */}
                    <FormField
                        control={form.control}
                        name="sale_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sale Price (₱) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Discount Percentage */}
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="0"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Sale Pricing Information:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• Sale price is the final selling price of the costume</li>
                        <li>• Discount is optional and reduces the sale price</li>
                        <li>• Add-ons can be included for additional revenue</li>
                        <li>• All sales are final - no returns or refunds</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};