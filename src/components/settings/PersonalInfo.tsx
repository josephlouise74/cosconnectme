import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useGetAllDataBarangays } from '@/lib/api/barangaysApi'
import { useUpdateInfoBorrower } from '@/lib/api/borrowerApi'

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { cn } from '@/lib/utils'
import { PersonalDetailsForm, personalDetailsSchema } from '@/lib/zodSchema/userBorrowerSchema'

import { municipalities } from '@/utils/philippine_datasets/municipality'
import { provinces } from '@/utils/philippine_datasets/province'
import { regions } from '@/utils/philippine_datasets/region'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

const PersonalInfo = () => {
    // Get auth state and user data
    const { userRolesData, isLoading } = useSupabaseAuth();

    // Compute default values from userRolesData
    const defaultValues = useMemo(() => ({
        first_name: userRolesData?.personal_info.first_name || '',
        middle_name: userRolesData?.personal_info.middle_name || '',
        last_name: userRolesData?.personal_info.last_name || '',
        username: userRolesData?.username || '',
        email: userRolesData?.email || '',
        phone_number: userRolesData?.personal_info.phone_number || '',
        bio: userRolesData?.personal_info.bio || '',
        street: userRolesData?.address_information?.street || '',
        barangay: userRolesData?.address_information?.barangay || '',
        zip_code: userRolesData?.address_information?.zip_code || '',
        country: userRolesData?.address_information?.country || '',
        region: userRolesData?.address_information?.region || '',
        province: userRolesData?.address_information?.province || '',
        city: userRolesData?.address_information?.city && userRolesData.address_information.city.id
            ? { id: userRolesData.address_information.city.id, name: userRolesData.address_information.city.name || '' }
            : { id: '', name: '' }
    }), [userRolesData]);

    // State for editing address
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    // Use the update borrower API hook
    const { mutateAsync: updateBorrowerInfo, isPending: isUpdating } = useUpdateInfoBorrower(userRolesData?.username || '');

    const form = useForm<PersonalDetailsForm>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues,
    })

    // Watch selected values for dependent dropdowns
    const selectedRegion = useWatch({ control: form.control, name: "region" });
    const selectedProvince = useWatch({ control: form.control, name: "province" });
    const selectedCity = useWatch({ control: form.control, name: "city" });

    // Get barangays data using the API
    const { barangays, isLoading: isLoadingBarangays, isError: isBarangayError } = useGetAllDataBarangays(
        selectedCity?.id ? { id: selectedCity.id, name: selectedCity.name } : undefined
    );

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
        if (!selectedCity?.id) return [];
        return barangays || [];
    }, [selectedCity, barangays]);

    // Update form values when profile data is available
    useEffect(() => {
        if (userRolesData) {
            form.reset({
                first_name: userRolesData.personal_info.first_name || '',
                middle_name: userRolesData.personal_info.middle_name || '',
                last_name: userRolesData.personal_info.last_name || '',
                username: userRolesData.username || '',
                email: userRolesData.email || '',
                phone_number: userRolesData.personal_info.phone_number || '',
                bio: userRolesData.personal_info.bio || '',
                street: userRolesData.address_information?.street || '',
                barangay: userRolesData.address_information?.barangay || '',
                zip_code: userRolesData.address_information?.zip_code || '',
                country: userRolesData.address_information?.country || '',
                region: userRolesData.address_information?.region || '',
                province: userRolesData.address_information?.province || '',
                city: userRolesData.address_information?.city && userRolesData.address_information.city.id
                    ? { id: userRolesData.address_information.city.id, name: userRolesData.address_information.city.name || '' }
                    : { id: '', name: '' }
            });
        }
    }, [userRolesData, form]);

    const onSubmit = async (data: PersonalDetailsForm) => {
        try {
            if (!userRolesData?.user_id) {
                toast.error('User ID not found');
                return;
            }

            // Transform the form data to match BorrowerPersonalInfoFormDataType
            const transformedData = {
                first_name: data.first_name,
                middle_name: data.middle_name || '',
                last_name: data.last_name,
                username: data.username,
                email: data.email,
                phone_number: data.phone_number, // Will be blank unless you map it
                bio: data.bio || '',
                street: data.street || '',
                barangay: data.barangay || '',
                zip_code: data.zip_code || '',
                country: data.country || '',
                region: data.region || '',
                province: data.province || '',
                city: data.city || { id: '', name: '' },
            };

            await updateBorrowerInfo({
                id: userRolesData.user_id,
                data: transformedData
            });

            toast.success('Profile updated successfully');

        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        }
    }

    if (isLoading) {
        return <div className="w-full flex justify-center items-center py-12">Loading...</div>;
    }

    return (
        <Card className="w-full border-none shadow-none">
            <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                <Separator className="flex-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your first name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="middle_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Middle Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your middle name (optional)"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your last name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your username"
                                                    disabled
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Your email"
                                                    disabled
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="Your phone number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about yourself"
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Address Information */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">Address Information</h3>
                                    <Separator className="flex-1" />
                                </div>
                                {!isEditingAddress && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditingAddress(true)}
                                    >
                                        Edit Address Information
                                    </Button>
                                )}
                            </div>
                            {!isEditingAddress ? (
                                // VIEW MODE: Show address as plain text
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div>
                                        <span className="font-medium">Region:</span> {userRolesData?.address_information?.region || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Province:</span> {userRolesData?.address_information?.province || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">City/Municipality:</span> {userRolesData?.address_information?.city?.name || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Barangay:</span> {userRolesData?.address_information?.barangay || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Street Address:</span> {userRolesData?.address_information?.street || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Zip Code:</span> {userRolesData?.address_information?.zip_code || '-'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Country:</span> {userRolesData?.address_information?.country || '-'}
                                    </div>
                                </div>
                            ) : (
                                // EDIT MODE: Show address form fields
                                <>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Region Select */}
                                            <FormField
                                                control={form.control}
                                                name="region"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Region</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                // Reset dependent fields
                                                                form.setValue("province", "");
                                                                form.setValue("city", { id: "", name: "" });
                                                                form.setValue("barangay", "");
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a region" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {regions.map((region) => (
                                                                    <SelectItem
                                                                        key={region.region_id}
                                                                        value={region.region_name}
                                                                    >
                                                                        {region.region_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Province Select */}
                                            <FormField
                                                control={form.control}
                                                name="province"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Province</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                // Reset dependent fields
                                                                form.setValue("city", { id: "", name: "" });
                                                                form.setValue("barangay", "");
                                                            }}
                                                            value={field.value || ""}
                                                            disabled={!selectedRegion}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a province" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {filteredProvinces.map((province) => (
                                                                    <SelectItem
                                                                        key={province.province_id}
                                                                        value={province.province_name}
                                                                    >
                                                                        {province.province_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* City/Municipality Select */}
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City/Municipality</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const selectedCity = filteredCities.find(city => city.municipality_id.toString() === value);
                                                                field.onChange({
                                                                    id: value,
                                                                    name: selectedCity?.municipality_name || ''
                                                                });
                                                                // Reset barangay
                                                                form.setValue("barangay", "");
                                                            }}
                                                            value={field.value?.id || ""}
                                                            disabled={!selectedProvince}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a city/municipality" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {filteredCities.map((city) => (
                                                                    <SelectItem
                                                                        key={city.municipality_id}
                                                                        value={city.municipality_id.toString()}
                                                                    >
                                                                        {city.municipality_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Barangay Select */}
                                            <FormField
                                                control={form.control}
                                                name="barangay"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Barangay</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className={cn(
                                                                            "w-full justify-between",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                        disabled={!selectedCity?.id || isLoadingBarangays}
                                                                    >
                                                                        {isLoadingBarangays ? (
                                                                            <div className="flex items-center">
                                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                                                                                Loading barangays...
                                                                            </div>
                                                                        ) : isBarangayError ? (
                                                                            <span className="text-destructive">Error loading barangays</span>
                                                                        ) : field.value ? (
                                                                            filteredBarangays.find(
                                                                                (barangay) => barangay.barangay_name === field.value
                                                                            )?.barangay_name
                                                                        ) : (
                                                                            "Select barangay"
                                                                        )}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search barangay..." />
                                                                    {isLoadingBarangays ? (
                                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                                            Loading barangays...
                                                                        </div>
                                                                    ) : isBarangayError ? (
                                                                        <div className="py-6 text-center text-sm text-destructive">
                                                                            {"Failed to load barangays"}
                                                                        </div>
                                                                    ) : filteredBarangays.length === 0 ? (
                                                                        <CommandEmpty>No barangays found for this city.</CommandEmpty>
                                                                    ) : (
                                                                        <CommandGroup className="max-h-[300px] overflow-auto">
                                                                            {filteredBarangays.map((barangay) => (
                                                                                <CommandItem
                                                                                    value={barangay.barangay_name}
                                                                                    key={barangay.barangay_id}
                                                                                    onSelect={() => {
                                                                                        field.onChange(barangay.barangay_name);
                                                                                    }}
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "mr-2 h-4 w-4",
                                                                                            field.value === barangay.barangay_name
                                                                                                ? "opacity-100"
                                                                                                : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                    {barangay.barangay_name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    )}
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Street Address Input */}
                                        <FormField
                                            control={form.control}
                                            name="street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street Address</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center relative">
                                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-10"
                                                                placeholder="House #, Building, Street"
                                                                {...field}
                                                                value={field.value || ''}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <FormField
                                                control={form.control}
                                                name="zip_code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Zip Code</FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-center relative">
                                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    className="pl-10"
                                                                    placeholder="Enter your Zip Code"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Country</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Your country"
                                                                {...field}
                                                                value={field.value || ''}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                </>
                            )}
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="min-w-[120px] h-10 bg-primary hover:bg-primary/90"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default PersonalInfo