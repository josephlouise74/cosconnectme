import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { axiosApiClient } from './axiosApiClient';

export const useCreateRequestRentalCostume = () => {
    const createRequestRentalCostumeApiRequest = async (payload: any): Promise<any> => {
        try {
            const response = await axiosApiClient.post(
                '/rental/request',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    validateStatus: () => true,
                }
            );

            const responseData = response.data;
            console.log("API response:", responseData);

            if (response.status >= 400 || !responseData.success) {
                const errorMessage = responseData?.message || 'Failed to create rental request';
                console.error('API Error:', {
                    status: response.status,
                    message: errorMessage,
                    data: responseData
                });
                throw new Error(errorMessage);
            }

            // Return the complete response structure to match your sample
            return responseData;
        } catch (error: any) {
            console.error('Rental request error:', error);

            if (error instanceof AxiosError) {
                const errorMessage = error.response?.data?.message || error.message;
                console.error('Axios Error:', {
                    status: error.response?.status,
                    message: errorMessage,
                    data: error.response?.data
                });
                throw new Error(errorMessage);
            }

            if (error instanceof Error) {
                console.error('Error:', error.message);
                throw error;
            }

            throw new Error('An unknown error occurred');
        }
    };

    const mutation = useMutation({
        mutationFn: createRequestRentalCostumeApiRequest,
        onSuccess: () => {
            toast.success('Rental request sent successfully');
        },
        onError: (error: Error) => {
            console.error('Mutation Error:', error.message);
            toast.error(error.message || 'Failed to send rental request');
        }
    });

    return {
        isRequestRentalCostumeLoading: mutation.isPending,
        createRequestRentalCostume: mutation.mutateAsync,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
    };
};