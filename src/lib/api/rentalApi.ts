import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { axiosApiClient } from './axiosApiClient';



export interface RentalRejectionResponse {
    success: boolean;
    message: string;
    data: {
        rejections: {
            id: string;
            original_rental_id: string;
            reference_code: string;
            costume: {
                id: string;
                name: string;
                brand: string;
                category: string;
                sizes: string;
                rental_price: string;
                security_deposit: string;
                main_images: {
                    front: string;
                    back: string;
                };
            };
            renter: {
                uid: string;
                name: string;
                email: string;
                phone: string;
            };
            request: {
                start_date: string;
                end_date: string;
                rental_amount: string;
                security_deposit: string;
                total_amount: string;
                pickup_location: string;
                delivery_method: string;
                special_instructions: string | null;
                created_at: string;
            };
            rejection: {
                reason: string;
                message: string;
                rejected_at: string;
                rejected_by: string;
            };
            payment: {
                amount: string;
                status: string;
                processed_at: string;
            };
            created_at: string;
        }[];
        pagination: {
            current_page: number;
            total_pages: number;
            total_count: number;
            per_page: number;
            has_next_page: boolean;
            has_prev_page: boolean;
            next_page: number | null;
            prev_page: number | null;
        };
        filters: {
            lender_id: string;
            page: number;
            limit: number;
        };
    };
}


export const useGetRentalRejections = (userId: string) => {
    const getRentalRejections = async (): Promise<RentalRejectionResponse> => {
        const { data } = await axiosApiClient.get<RentalRejectionResponse>(
            `/rental/rejections/${userId}`
        );
        return data;
    };


    const query = useQuery<RentalRejectionResponse>({
        queryKey: ["rentalRejections"],
        queryFn: getRentalRejections,
    });


    return {
        isLoading: query.isLoading,
        data: query.data,
        error: query.error,
        refetch: query.refetch,
    };
};


// Types
type RentalStatus = "accept" | "reject" | "delivered" | "returned";

interface UpdateRentalStatusPayload {
    rental_id: string;
    lender_id: string;
    status: RentalStatus;
    reject_message?: string;
    return_notes?: string;
}

interface UpdateRentalStatusError {
    success: false;
    error: string;
    details?: string;
    status?: number;
}

// Main hook for updating rental request status
export const useUpdateRentalRequestStatus = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<
        any,
        AxiosError<UpdateRentalStatusError>,
        UpdateRentalStatusPayload
    >({
        mutationFn: async (payload: UpdateRentalStatusPayload) => {
            // Validate required fields
            if (!payload.rental_id || !payload.lender_id || !payload.status) {
                throw new Error("Missing required fields: rental_id, lender_id, and status are required");
            }

            if (!["accept", "reject", "delivered", "returned"].includes(payload.status)) {
                throw new Error("Status must be one of: 'accept', 'reject', 'delivered', 'returned'");
            }

            // Validate reject_message is provided when rejecting
            if (payload.status === "reject" && !payload.reject_message?.trim()) {
                throw new Error("Rejection message is required when rejecting a rental");
            }

            // Construct request body
            const requestBody: UpdateRentalStatusPayload = {
                rental_id: payload.rental_id,
                lender_id: payload.lender_id,
                status: payload.status,
            };

            // Add reject_message if status is reject
            if (payload.status === "reject") {
                requestBody.reject_message = payload.reject_message!.trim();
            }

            // Add return_notes if status is returned and notes are provided
            if (payload.status === "returned" && payload.return_notes?.trim()) {
                requestBody.return_notes = payload.return_notes.trim();
            }

            console.log("Request payload:", requestBody);

            const { data } = await axiosApiClient.put('/rental/update-rental-status', requestBody);
            return data;
        },
        /* onSuccess: (data, variables) => {
            const message = data?.message || 'Rental status updated successfully';
            toast.success(message);

            // Invalidate related queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['rental', variables.rental_id] });
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['lender-rentals', variables.lender_id] });

            // Also invalidate renter-related queries if applicable
            if (data?.data?.renter_uid) {
                queryClient.invalidateQueries({ queryKey: ['renter-rentals', data.data.renter_uid] });
            } */

                onSuccess: (data, variables) => {
                    const message = data?.message || 'Rental status updated successfully';
                    toast.success(message);
        
                    // Invalidate related queries to refresh UI
                    queryClient.invalidateQueries({ queryKey: ['rental', variables.rental_id] });
                    queryClient.invalidateQueries({ queryKey: ['rentalData', variables.rental_id] });
                    queryClient.invalidateQueries({ queryKey: ['rentals'] });
                    queryClient.invalidateQueries({ queryKey: ['lender-rentals', variables.lender_id] });
        },
        onError: (error) => {
            const errorData = error.response?.data;
            const errorMessage = errorData?.error || error.message || "Failed to update rental status";

            // Enhanced error logging
            console.error("Rental status update error:", {
                status: error.response?.status,
                message: errorMessage,
                details: errorData?.details,
                originalError: error,
                errorObject: error,
            });

            toast.error(errorMessage);
        },
    });

    return {
        updateStatusAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset
    };
};

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




export interface ConfirmPaymentResponse {
    success: boolean;
    message: string;
    data: {
        payment_id: string;
        reference_code: string;
        session_id: string;
        rental_id: string;
        status_change: {
            previous_status: string;
            current_status: string;
            payment_service_status: string;
        };
        payment_details: {
            amount: number;
            currency: string;
            processed_at: string;
            payment_method: string;
            payment_reference: string;
        };
        rental: {
            id: string;
            status: string;
            costume_name: string;
            customer_name: string;
            reference_code: string;
        };
        updated_at: string;
    };
    already_paid?: boolean;
}

export const useConfirmPayment = () => {
    const confirmPaymentApiRequest = async (
        payload: { reference: string }
    ): Promise<ConfirmPaymentResponse> => {
        const response = await axiosApiClient.post<ConfirmPaymentResponse>(
            `/rental/confirm-payment/${payload.reference}`,
            payload
        );

        console.log("response", response)
        return response.data;
    };


    const { mutate: confirmPayment, data, error, isPending: isLoading } = useMutation({
        mutationFn: confirmPaymentApiRequest,
    });

    return {
        confirmPayment,
        data,
        error,
        isLoading,
    };
};



interface Rental {
    id: string
    reference_code: string
    status: string
    total_amount: string
    start_date: string
    end_date: string
    created_at: string
    costume: Costume
    payment_status: string
    amount_paid: string
}



interface GetMyRentalsResponse {
    success: boolean
    data: {
        rentals: Rental[]
        pagination: Pagination
    }
    message: string
}

interface GetMyRentalsParams {
    userId: string
    page?: number
    limit?: number
    status?: string
}

export const useGetMyRentals = ({ userId, page = 1, limit = 10, status }: GetMyRentalsParams) => {
    const getMyRentalsApiRequest = async (): Promise<GetMyRentalsResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status }),
            })

            const response = await axiosApiClient.get<GetMyRentalsResponse>(
                `/rental/my-rentals/${userId}?${params.toString()}`,
            )

            return response.data
        } catch (error) {
            console.error("Error fetching rentals:", error)
            throw error
        }
    }

    const query = useQuery({
        queryKey: ["my-rentals", userId, page, limit, status],
        queryFn: getMyRentalsApiRequest,
        enabled: !!userId, // Only run query if userId is provided
    })

    return {
        isLoading: query.isLoading,
        data: query.data,
        error: query.error,
        refetch: query.refetch,
    }
}



// --- Params Type ---
export interface GetLenderRentalsParams {
    userId: string
    page?: number
    limit?: number
    status?: string
}

// --- Response Type (updated one you asked for) ---
export interface LenderRentalRequestsResponse {
    success: boolean
    data: {
        rental_requests: LenderRentalRequest[];
        pagination: Pagination;
        summary: Summary;
    };
    message: string;
}

export interface LenderRentalRequest {
    id: string;
    reference_code: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    rental_amount: string;
    security_deposit: string;
    total_amount: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    pickup_location: string;
    delivery_method: "pickup" | "delivery";
    special_instructions: string | null;
    costume: Costume;
    renter: Renter;
    lender_name: string; // ✅ added
    payment_summary: PaymentSummary;
    created_at: string;
    updated_at: string;
}

export interface Costume {
    id: string;
    name: string;
    brand: string;
    category: string;
    sizes: string;
    image: string;
}

export interface Renter {
    uid: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface PaymentSummary {
    status: "unpaid" | "partially_paid" | "fully_paid";
    total_paid: string;
    pending_amount: string;
    payment_count: number;
    last_payment_date: string;
}

export interface Pagination {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface Summary {
    total_requests: number;
    status_filter: "all" | "pending" | "confirmed" | "cancelled" | "completed";
    lender_id: string;
}

// --- Hook ---
export const useGetLenderRentalsRequests = ({ userId, page = 1, limit = 10, status }: GetLenderRentalsParams) => {
    const getLenderRentalsApiRequest = async (): Promise<LenderRentalRequestsResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status }),
            })

            const response = await axiosApiClient.get<LenderRentalRequestsResponse>(
                `/rental/lender-rentals/${userId}?${params.toString()}`, // 👈 changed endpoint to "lender-rentals"
            )

            return response.data
        } catch (error) {
            console.error("Error fetching lender rentals:", error)
            throw error
        }
    }

    const query = useQuery({
        queryKey: ["lender-rentals", userId, page, limit, status],
        queryFn: getLenderRentalsApiRequest,
        enabled: !!userId,
    })

    return {
        isLoading: query.isLoading,
        data: query.data,
        error: query.error,
        refetch: query.refetch,
    }
}





// ✅ Updated data type matching the actual API response
export interface GetRentalByIdResponse {
    success: boolean;
    data: {
        id: string;
        reference_code: string;
        status: string;
        start_date: string;
        end_date: string;
        actual_return_date: string | null;
        duration_days: number;
        rental_amount: string;
        security_deposit: string;
        total_amount: string;
        extended_days: number;
        extension_fee: string;
        damage_reported: boolean;
        damage_cost: string;
        pickup_location: string;
        delivery_method: string;
        special_instructions: string;
        initial_condition_notes: string | null;
        return_condition_notes: string | null;
        notes: string;
        accepted_at: string | null;
        accepted_by: string | null;
        costume: {
            id: string;
            name: string;
            brand: string;
            category: string;
            sizes: string;
            rental_price: string;
            security_deposit: string;
            description: string;
            themes: string[];
            gender: string;
            main_image: string;
            images: string[];
            availability_status: boolean;
        };
        renter: {
            uid: string;
            name: string;
            email: string;
            phone: string;
            profile_image: string;
        };
        lender: {
            uid: string;
            name: string;
            email: string;
            phone: string;
            profile_image: string;
        };
        payment_summary: {
            status: string;
            total_paid: string;
            pending_amount: string;
            total_refunded: string;
            payment_count: number;
            refund_count: number;
            last_payment_date: string | null;
            has_active_session: boolean;
            active_session?: {
                id: string;
                session_id: string;
                checkout_url: string;
                expires_at: string;
                amount: string;
            };
        };
        payments: {
            id: string;
            reference_code: string;
            status: string;
            amount: string;
            payment_type: string;
            payment_method: string;
            payment_reference: string;
            description: string;
            processed_at: string | null;
            receipt_url: string | null;
            receipt_number: string | null;
            processor_notes: string | null;
            paymongo_data: any;
            metadata: any;
            created_at: string;
            updated_at: string;
        }[];
        payment_gcash_number: string | null;
        refund_gcash_number: string | null;
        refund_account_name: string | null;
        costume_snapshot: {
            id: string;
            name: string;
            brand: string;
            sizes: string;
            category: string;
            lender_info: {
                uid: string;
                name: string;
                email: string;
                phone: string;
                is_business: boolean;
            };
            main_images: {
                back: string;
                front: string;
            };
            rental_price: string;
            security_deposit: string;
        };
        renter_snapshot: {
            uid: string;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        created_at: string;
        updated_at: string;
    };
    message: string;
}

// ✅ Updated API Hook that matches the actual response structure
export const useGetRentalDataById = (rental_id: string) => {
    const getRentalDataById = async (): Promise<GetRentalByIdResponse> => {
        if (!rental_id) {
            throw new Error("Rental ID is required");
        }

        const { data } = await axiosApiClient.get<GetRentalByIdResponse>(
            `/rental/${rental_id}`
        );
        return data;
    };

    const query = useQuery<GetRentalByIdResponse>({
        queryKey: ["rentalData", rental_id],
        queryFn: getRentalDataById,
        enabled: !!rental_id && rental_id.length > 0, // Only run if rental_id is valid
        retry: false, // Don't retry on error - prevents potential cascade of errors
    });

    // The rental data is directly in the data object
    const rentalData = query.data?.data;

    return {
        ...query,
        rental: rentalData, // The complete rental object
        costume: rentalData?.costume,
        costumeSnapshot: rentalData?.costume_snapshot,
        renterSnapshot: rentalData?.renter_snapshot,
        lender: rentalData?.lender,
        payments: rentalData?.payments,
        paymentSummary: rentalData?.payment_summary,
    };
};
