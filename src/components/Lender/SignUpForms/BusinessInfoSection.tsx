import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { municipalities } from "@/utils/philippine_datasets/municipality";
import { provinces } from "@/utils/philippine_datasets/province";
import { regions } from "@/utils/philippine_datasets/region";
import { AlertCircle, BadgeCheck, Building2, CheckCircle, Mail, MapPin, RefreshCw, Shield, Smartphone, Star, Zap } from "lucide-react";
import { useMemo } from "react";
import { Control, useWatch } from "react-hook-form";

import { BusinessDescriptionSection } from "./BusinessDescription";
import { IconInputField } from "./FormFields";

import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetAllDataBarangays } from "@/lib/api/barangaysApi";
import { cn } from "@/lib/utils";
import { LenderSignUpFormData } from "@/lib/zodSchema/lenderSchema";
import { Check, ChevronsUpDown } from "lucide-react";

interface BusinessInfoSectionProps {
  control: Control<LenderSignUpFormData>;
}

export const BusinessInfoSection = ({ control }: BusinessInfoSectionProps) => {

  // Watch selected values for dependent dropdowns
  const selectedRegion = useWatch({ control, name: "region" });
  const selectedProvince = useWatch({ control, name: "province" });
  const selectedCity = useWatch({ control, name: "city" });
  const selectedBusinessType = useWatch({ control, name: "businessType" });

  // Get barangays data using the API - use the city ID from the object
  const { barangays, isLoading: isLoadingBarangays, isError: isBarangayError, refetch: refetchBarangays } = useGetAllDataBarangays(
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg ">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold ">Business Information</h3>
          <p className="text-sm text-muted-foreground">Enter your business details and address</p>
        </div>
      </div>

      <IconInputField
        control={control}
        name="businessName"
        label="Registered Business Name"
        placeholder="Official business name"
        icon={Building2}
        maxLength={50}
      />
      <div className="text-xs text-muted-foreground text-right">
        {control._formValues.businessName?.length || 0}/50
      </div>

      <IconInputField
        control={control}
        name="businessPhoneNumber"
        label="Business Phone"
        placeholder="Business contact number"
        type="tel"
        icon={Smartphone}
        fieldType="businessPhoneNumber"
      />

      <IconInputField
        control={control}
        name="businessEmail"
        label="Business Email"
        placeholder="Business email address"
        type="email"
        icon={Mail}
      />

      <IconInputField
        control={control}
        name="business_telephone"
        label="Business Telephone (Optional)"
        placeholder="Business telephone number"
        type="tel"
        icon={Smartphone}
        fieldType="business_telephone"
      />

      <BusinessDescriptionSection control={control} />

      <FormField
        control={control}
        name="businessType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="STORE">Registered Store</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual Renter</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Business Type Benefits Comparison */}
      {selectedBusinessType && (
        <div className="space-y-4">

          {selectedBusinessType === "STORE" ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Registered Store Benefits</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      By registering as a verified store, you'll unlock exclusive benefits and build trust with customers.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Verified Badge</h5>
                      <p className="text-xs text-muted-foreground">Display a "Verified Store" badge on your profile</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Fast Approval</h5>
                      <p className="text-xs text-muted-foreground">Priority processing and faster account verification</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Legitimate Business</h5>
                      <p className="text-xs text-muted-foreground">Prove your business is officially registered</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Customer Trust</h5>
                      <p className="text-xs text-muted-foreground">Build confidence with verified business status</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Higher Visibility</h5>
                      <p className="text-xs text-muted-foreground">Featured placement in search results</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Premium Support</h5>
                      <p className="text-xs text-muted-foreground">Priority customer service assistance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
                    <Building2 className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Individual Lender Benefits</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start renting out your costumes as an individual with these benefits and limitations.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Quick Setup</h5>
                      <p className="text-xs text-muted-foreground">Start renting immediately with minimal requirements</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <Zap className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Flexible Listing</h5>
                      <p className="text-xs text-muted-foreground">List individual costumes or small collections</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <Shield className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Secure Payments</h5>
                      <p className="text-xs text-muted-foreground">Safe and reliable payment processing</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <Star className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Customer Reviews</h5>
                      <p className="text-xs text-muted-foreground">Build reputation through customer feedback</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <Building2 className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Easy Management</h5>
                      <p className="text-xs text-muted-foreground">Simple dashboard to manage your rentals</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm">Upgrade Path</h5>
                      <p className="text-xs text-muted-foreground">Easily upgrade to verified store later</p>
                    </div>
                  </div>
                </div>

                {/* Limitations Section */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h5 className="font-medium text-foreground text-sm mb-3">Limitations:</h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted mt-0.5">
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <h6 className="font-medium text-foreground text-xs">No Verified Badge</h6>
                        <p className="text-xs text-muted-foreground">No "Verified Store" badge on profile</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted mt-0.5">
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <h6 className="font-medium text-foreground text-xs">3-Day Approval</h6>
                        <p className="text-xs text-muted-foreground">Standard processing time for verification</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted mt-0.5">
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <h6 className="font-medium text-foreground text-xs">Limited Visibility</h6>
                        <p className="text-xs text-muted-foreground">Lower priority in search results</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted mt-0.5">
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <h6 className="font-medium text-foreground text-xs">Standard Support</h6>
                        <p className="text-xs text-muted-foreground">Regular customer service assistance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Address Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-md font-semibold ">Address Information</h4>
            <p className="text-sm text-muted-foreground">Enter your business address details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Region Select */}
          <FormField
            control={control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dependent fields
                    control._formValues.province = "";
                    control._formValues.city = { id: "", name: "" };
                    control._formValues.barangay = "";
                  }}
                  defaultValue={field.value}
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
            control={control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dependent fields
                    control._formValues.city = { id: "", name: "" };
                    control._formValues.barangay = "";
                  }}
                  defaultValue={field.value}
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
            control={control}
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
                    control._formValues.barangay = "";
                  }}
                  defaultValue={field.value?.id}
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
            control={control}
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
                          <div className="flex items-center justify-between w-full">
                            <span className="text-destructive">Error loading barangays</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                refetchBarangays();
                              }}
                              className="flex items-center gap-1 h-6 px-2"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </Button>
                          </div>
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
          control={control}
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
                    maxLength={100}
                    {...field}
                  />
                </div>
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {(field.value?.length || 0)}/100
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <IconInputField
          control={control}
          name="zipCode"
          label="Zip Code"
          placeholder="Enter your Zip Code"
          icon={MapPin}
          fieldType="zipcode"
        />
      </div>
    </div>
  );
};