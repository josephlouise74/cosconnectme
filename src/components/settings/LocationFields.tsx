import { Municipality } from '@/lib/apis/municipalitiesApi';
import type { BorrowerUser } from '@/lib/zodFormSchema/borrowerSchema';
import { Barangay, Province, Region } from '@/types/philippineDataType';
import { Control } from 'react-hook-form';

interface LocationFieldsProps {
    control: Control<BorrowerUser>;
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

