

export type Province = {
    code: string; // e.g., "012800000"
    name: string;
    isCapital: boolean;
    regionCode: string; // links to Region.code
    islandGroupCode: 'luzon' | 'visayas' | 'mindanao';
    psgc10DigitCode: string;
};


export type Region = {
    id: number;
    created_at: string; // Timestamp of when the region was created
    updated_at: string; // Timestamp of when the region was last updated
    name: string; // e.g., "Region I (Ilocos Region)"
    code: string; // e.g., "0100000000"
};

// types.ts or at the top of your hook file
export interface CityOrMunicipality {
    code: string;
    name: string;
    oldName: string;
    isCapital: boolean;
    isCity: boolean;
    isMunicipality: boolean;
    provinceCode: string;
    districtCode: string | boolean | null;
    regionCode: string;
    islandGroupCode: 'luzon' | 'visayas' | 'mindanao' | string;
    psgc10DigitCode: string;
}



export type Barangay = {
    code: string; // e.g., "012801001"
    name: string;
    cityOrMunicipalityCode: string; // links to CityOrMunicipality.code
    provinceCode: string; // optional, but can be useful for quick lookups
    regionCode: string; // optional
    psgc10DigitCode: string;
};


export type District = {
    code: string;
    name: string;
    regionCode: string;
    islandGroupCode: 'luzon' | 'visayas' | 'mindanao';
    psgc10DigitCode: string;
};


