import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'


import { municipalities } from '@/utils/philippine_datasets/municipality'
import { provinces } from '@/utils/philippine_datasets/province'
import { regions } from "@/utils/philippine_datasets/region"
import { FileText, Loader2, Mail, MapPin, MapPinIcon, Phone, User } from 'lucide-react'


interface EditProfileBorrowerDialogSectionProps {
    profileData: any;
    trigger?: React.ReactNode;
    onProfileUpdate?: (data: any) => Promise<void>;
}

// Utility to map userRolesData to ProfileFormBorrowerValues
export function mapUserRolesDataToProfileFormBorrowerValues(userRolesData: any) {
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

    /*     // Initialize form with profile data
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
        }, [selectedCity, form]); */

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


        </Dialog>
    )
}

export default React.memo(EditProfileBorrowerDialogSection)