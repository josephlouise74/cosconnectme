import { FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface RegionSelectProps {
    field: any;
    regions: any[];
}

const RegionSelect = React.memo(({ field, regions }: RegionSelectProps) => (
    <Select
        onValueChange={field.onChange}
        value={field.value || ""}
    >
        <FormControl>
            <SelectTrigger>
                <SelectValue placeholder="Select a region" />
            </SelectTrigger>
        </FormControl>
        <SelectContent>
            {regions.map((region: any) => (
                <SelectItem
                    key={region.region_id}
                    value={region.region_name}
                >
                    {region.region_name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
));

RegionSelect.displayName = 'RegionSelect';

export default RegionSelect; 