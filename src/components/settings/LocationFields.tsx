
import { Municipality } from '@/lib/api/municipalitiesApi';
import { Barangay, Province, Region } from '@/lib/types/philippineDataType';
import { Control } from 'react-hook-form';

interface LocationFieldsProps {
    control: Control<any>;
    regions: Region[];
    provinces: Province[];
    cities: Municipality[];
    barangays: Barangay[];
    isLoadingBarangays: boolean;
    selectedRegion: string;
    selectedProvince: string;
    selectedCity: string;
    isEditing: boolean;
}

export const LocationFields = ({

}: LocationFieldsProps) => {
    return (
        <>
            location fields i delete it
        </>
    );
};

