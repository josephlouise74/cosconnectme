import { FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface ProvinceSelectProps {
    field: any;
    filteredProvinces: any[];
    disabled?: boolean;
}

const ProvinceSelect = React.memo(({ field, filteredProvinces, disabled }: ProvinceSelectProps) => (
    <Select
        onValueChange={field.onChange}
        value={field.value || ""}
        disabled={disabled || false}
    >
        <FormControl>
            <SelectTrigger>
                <SelectValue placeholder="Select a province" />
            </SelectTrigger>
        </FormControl>
        <SelectContent>
            {filteredProvinces.map((province: any) => (
                <SelectItem
                    key={province.province_id}
                    value={province.province_name}
                >
                    {province.province_name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
));

ProvinceSelect.displayName = 'ProvinceSelect';

export default ProvinceSelect; 