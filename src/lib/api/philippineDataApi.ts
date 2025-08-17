import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Barangay, CityOrMunicipality, District, Province, Region } from '../types/philippineDataType';


// Define base URL for API requests
/* const API_BASE_URL = 'http://localhost:8000/api/v1';
 */
// Create axios instance with default config
/* const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
 */



export const useFetchAllRegions = () => {
    const fetchAllRegions = async (): Promise<Region[]> => {
        try {
            const response = await axios.get<Region[]>('https://psgc.cloud/api/regions');
            console.log('response', response.data);
            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('Region fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch regions. Please try again.'
            );
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['regions'],
        queryFn: fetchAllRegions,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};

export const useFetchAllProvinces = () => {
    const fetchAllProvinces = async (): Promise<Province[]> => {
        try {
            const response = await axios.get<Province[]>('https://psgc.cloud/api/regions');
            console.log('response', response.data);
            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('Province fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch provinces. Please try again.'
            );
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['provinces'],
        queryFn: fetchAllProvinces,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};


export const useFetchAllDistricts = () => {
    const fetchAllDistricts = async (): Promise<District[]> => {
        try {
            const response = await axios.get<District[]>("https://psgc.gitlab.io/api/districts");
            console.log("response", response.data);
            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('District fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch districts. Please try again.'
            );
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['districts'],
        queryFn: fetchAllDistricts,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    };
};




export const useFetchAllBarangays = () => {
    const fetchAllBarangays = async (): Promise<Barangay[]> => {
        try {
            const response = await axios.get<Barangay[]>(
                'https://psgc.gitlab.io/api/barangays'
            );
            console.log('response', response.data);
            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('Barangay fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch barangays. Please try again.'
            );
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['barangays'],
        queryFn: fetchAllBarangays,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};


export const useFetchAllCitiesAndMunicipalities = () => {
    const fetchAllMunicipalities = async (): Promise<CityOrMunicipality[]> => {
        try {
            const response = await axios.get<CityOrMunicipality[]>(
                'https://psgc.gitlab.io/api/cities-municipalities'
            );
            console.log('response', response.data);
            return response.data;
        } catch (error: any) {
            const axiosError = error as any;
            console.error('Category fetch error:', axiosError);
            toast.error(
                axiosError.response?.data?.message ||
                'Failed to fetch municipalities. Please try again.'
            );
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ['municipalities'],
        queryFn: fetchAllMunicipalities,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};
