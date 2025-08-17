import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { FormControl } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';

interface BarangaySelectProps {
    field: any;
    filteredBarangays: any[];
    isLoading?: boolean;
    disabled?: boolean;
}

const BarangaySelect = React.memo(({ field, filteredBarangays, isLoading, disabled }: BarangaySelectProps) => (
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
                    disabled={disabled || isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                            Loading...
                        </div>
                    ) : field.value ? (
                        filteredBarangays.find(
                            (barangay: any) => barangay.barangay_name === field.value
                        )?.barangay_name || field.value
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
                {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Loading barangays...
                    </div>
                ) : filteredBarangays.length === 0 ? (
                    <CommandEmpty>No barangays found for this city.</CommandEmpty>
                ) : (
                    <CommandGroup className="max-h-[300px] overflow-auto">
                        {filteredBarangays.map((barangay: any) => (
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
));

BarangaySelect.displayName = 'BarangaySelect';

export default BarangaySelect; 