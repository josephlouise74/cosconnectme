import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useGetAllDataBarangays } from '@/lib/apis/barangaysApi'
import { profileFormBorrowerValues, ProfileFormBorrowerValues } from '@/lib/zodFormSchema/borrowerSchema'
import { municipalities } from '@/utils/philippine_datasets/municipality'
import { provinces } from '@/utils/philippine_datasets/province'
import { regions } from "@/utils/philippine_datasets/region"
import { FileText, Loader2, Mail, MapPin, MapPinIcon, Phone, User } from 'lucide-react'
import { BarangaySelect, CitySelect, ProvinceSelect, RegionSelect } from '../GeographicComponents'

interface EditProfileBorrowerDialogSectionProps {
    profileData: any;
    trigger?: React.ReactNode;
    onProfileUpdate?: (data: ProfileFormBorrowerValues) => Promise<void>;
}

// Utility to map userRolesData to ProfileFormBorrowerValues
export function mapUserRolesDataToProfileFormBorrowerValues(userRolesData: any): ProfileFormBorrowerValues {
    return {
        fullName: userRolesData?.personal_info?.full_name || '',
        username: userRolesData?.personal_info?.username || '',
        email: userRolesData?.email || '',
        phoneNumber: userRolesData?.personal_info?.phone_number || '',
        bio: '', // If you have a bio field, map it here
        street: userRolesData?.address_information?.street || '',
        barangay: userRolesData?.address_information?.barangay || '',
        city: userRolesData?.address_information?.city || { id: '', name: '' },
        province: userRolesData?.address_information?.province || '',
        region: userRolesData?.address_information?.region || '',
        country: userRolesData?.address_information?.country || 'Philippines',
        zipCode: userRolesData?.address_information?.zip_code || '',
    };
}

const EditProfileBorrowerDialogSection = ({
    profileData,
    trigger,
    onProfileUpdate
}: EditProfileBorrowerDialogSectionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form with profile data
    const form = useForm<ProfileFormBorrowerValues>({
        resolver: zodResolver(profileFormBorrowerValues),
        defaultValues: profileData,
    })

    const handleSubmit = useCallback(async (values: ProfileFormBorrowerValues) => {
        try {
            setIsSubmitting(true)

            // Console log the form data
            console.log('Profile update data:', values)

            // If onProfileUpdate is provided, call it with the form values
            if (onProfileUpdate) {
                await onProfileUpdate(values)
            } else {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            setIsOpen(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setIsSubmitting(false)
        }
    }, [onProfileUpdate]);

    // Watch form values - use getValues() instead of useWatch to prevent re-renders
    const selectedRegion = form.watch("region");
    const selectedProvince = form.watch("province");
    const selectedCity = form.watch("city");

    // Get barangays data using the API
    const { barangays, isLoading: isLoadingBarangays } = useGetAllDataBarangays(selectedCity as { id: string, name: string });

    // Memoize filtered provinces based on selected region
    const filteredProvinces = useMemo(() => {
        if (!selectedRegion) return [];
        const regionId = regions.find(r => r.region_name === selectedRegion)?.region_id;
        return provinces.filter(p => p.region_id === regionId);
    }, [selectedRegion]);

    // Memoize filtered cities based on selected province
    const filteredCities = useMemo(() => {
        if (!selectedProvince) return [];
        const provinceId = provinces.find(p => p.province_name === selectedProvince)?.province_id;
        if (!provinceId) return [];
        return municipalities.filter(m => m.province_id === provinceId);
    }, [selectedProvince]);

    // Memoize filtered barangays based on selected city
    const filteredBarangays = useMemo(() => {
        if (!selectedCity) return [];
        return barangays || [];
    }, [selectedCity, barangays]);

    // Reset dependent fields when parent changes
    React.useEffect(() => {
        form.setValue("province", "");
        form.setValue("city", { id: "", name: "" });
        form.setValue("barangay", "");
    }, [selectedRegion, form]);

    React.useEffect(() => {
        form.setValue("city", { id: "", name: "" });
        form.setValue("barangay", "");
    }, [selectedProvince, form]);

    React.useEffect(() => {
        form.setValue("barangay", "");
    }, [selectedCity, form]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <User className="h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <FileText className="h-4 w-4 text-primary" />
                                <h3 className="text-lg font-semibold">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" placeholder="Enter your full name" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" placeholder="Enter your username" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" placeholder="Enter your email" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" placeholder="Enter your phone number" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about yourself..."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Address Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <MapPinIcon className="h-4 w-4 text-primary" />
                                <h3 className="text-lg font-semibold">Address Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Region</FormLabel>
                                            <RegionSelect field={field} regions={regions} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="province"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Province</FormLabel>
                                            <ProvinceSelect
                                                field={field}
                                                filteredProvinces={filteredProvinces}
                                                disabled={!selectedRegion}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City/Municipality</FormLabel>
                                            <CitySelect
                                                field={field}
                                                filteredCities={filteredCities}
                                                disabled={!selectedProvince}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="barangay"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Barangay</FormLabel>
                                            <BarangaySelect
                                                field={field}
                                                filteredBarangays={filteredBarangays}
                                                isLoading={isLoadingBarangays}
                                                disabled={!selectedCity?.id}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-10"
                                                        placeholder="House #, Building, Street"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field: { onChange, value, ...restField } }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-10"
                                                        placeholder="Enter your zip code"
                                                        value={value || ""}
                                                        onChange={(e) => {
                                                            const input = e.target.value;
                                                            const numbers = input.replace(/\D/g, "");
                                                            let formattedValue = numbers;
                                                            if (numbers.length > 5) {
                                                                formattedValue = `${numbers.slice(0, 5)}-${numbers.slice(5, 9)}`;
                                                            }
                                                            onChange(formattedValue);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                                                            const isNumeric = /^[0-9\b]+$/.test(e.key);
                                                            if (!isNumeric && !allowedKeys.includes(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...restField}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default React.memo(EditProfileBorrowerDialogSection)