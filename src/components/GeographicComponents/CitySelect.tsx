import { FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface CitySelectProps {
    field: any;
    filteredCities: any[];
    disabled?: boolean;
}

const CitySelect = React.memo(({ field, filteredCities, disabled }: CitySelectProps) => (
    <Select
        onValueChange={(value) => {
            const selectedCity = filteredCities.find((city: any) => city.municipality_id.toString() === value);
            field.onChange({
                id: value,
                name: selectedCity?.municipality_name || ''
            });
        }}
        value={field.value?.id || ""}
        disabled={disabled || false}
    >
        <FormControl>
            <SelectTrigger>
                <SelectValue placeholder="Select a city/municipality" />
            </SelectTrigger>
        </FormControl>
        <SelectContent>
            {filteredCities.map((city: any) => (
                <SelectItem
                    key={city.municipality_id}
                    value={city.municipality_id.toString()}
                >
                    {city.municipality_name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
));

CitySelect.displayName = 'CitySelect';

export default CitySelect; 