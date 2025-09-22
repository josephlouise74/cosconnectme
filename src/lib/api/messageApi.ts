
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import ky, { HTTPError } from "ky"
import { toast } from "sonner"
import { MarkMessagesAsSeenResponse, MessageInquiryPayload } from "../types/messageType"
import { axiosApiClient } from "./axiosApiClient"

// Types for the response based on the sample JSON provided
export interface PartnerInfo {
    uid: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    username: string | null;
    profile_image: string | null;
}

export interface Contact {
    id: string;
    message: string;
    message_type: "text" | "system";
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
    is_seen: boolean;
    timestamp: string;
    un_read_count: number;
    isOwn: boolean;
    partner_info: PartnerInfo;
}

export interface GetContactsResponse {
    success: boolean;
    data: Contact[];
    next_cursor: string | null;
    message: string;
    error?: string;
    details?: string;
}

interface GetContactsParams {
    userId: string;
    cursor?: string;
    limit?: number;
}

export const useGetContacts = ({ userId, cursor, limit }: GetContactsParams) => {
    // API request function to fetch user contacts
    const getContacts = async (): Promise<GetContactsResponse> => {
        try {
            // Construct the URL with the userId
            const url = `/messages/contacts/${userId}`;
            // Make the GET request with query parameters for pagination if provided
            const response = await axiosApiClient.get(url, {
                params: {
                    cursor: cursor || undefined,
                    limit: limit || undefined,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching contacts:", error);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw {
                success: false,
                message: "Network error or server is unreachable",
                error: error.message || "Unknown error",
            };
        }
    };

    // Use React Query's useQuery to handle the API call
    const query = useQuery<GetContactsResponse, GetContactsResponse>({
        queryKey: ["contacts", userId, cursor, limit], // Unique key for caching, includes pagination params
        queryFn: getContacts,
        enabled: !!userId, // Only run query if userId is provided
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    });

    return {
        data: query.data, // The response data (contacts list, next_cursor, etc.)
        isLoading: query.isLoading, // Loading state
        isError: query.isError, // Error state
        error: query.error, // Error details if any
        isSuccess: query.isSuccess, // Success state
        refetch: query.refetch, // Function to manually refetch data
    };
};

export const refetchContacts = async (userId: string) => {
    const queryClient = useQueryClient();

    return queryClient.invalidateQueries({
        queryKey: ['contacts', userId],
        refetchType: 'active', // Only refetch active queries
    });
};

const API_BASE_URL = "http://localhost:8000/api/v2"

export const useSendMessageInquire = () => {
    const messageInquireApiRequest = async (payload: MessageInquiryPayload) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/message/inquire`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            return response.data
        } catch (error) {
            console.log("ss", error)
            let errorMessage = "Failed to send inquiry message."
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || errorMessage
            }
            toast.error(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const mutation = useMutation({
        mutationFn: messageInquireApiRequest,
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send inquiry message.")
        },
    })

    return {
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        sendMessage: mutation.mutateAsync,
    }
}



// backend response type
export type UserContact = {
    id: string;
    contact_user_id: string;
    contact_username: string;
    last_conversation_id: string | null;
    last_costume_id: string | null;
    last_costume_name: string | null;
    last_message: string | null;
    last_message_timestamp: string | null;
    last_message_sender_id: string | null;
    is_unread: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    contact_user_info: {
        uid: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        username: string | null;
        profile_image: string | null;
    };
};

export type GetUserContactsResponse = {
    success: boolean;
    data: UserContact[];
    pagination: {
        limit: number;
        has_more: boolean;
        next_cursor: string | null;
        total_fetched: number;
    };
    message: string;
};

export const useGetUserContacts = (
    userId: string,
    cursor?: string,
    limit: number = 20,
    enabled: boolean = true
) => {
    const getUserContactsApi = async (
        userId: string,
        cursor?: string,
        limit: number = 20
    ): Promise<GetUserContactsResponse> => {
        try {
            const searchParams = new URLSearchParams();
            if (cursor) searchParams.append("cursor", cursor);
            if (limit) searchParams.append("limit", limit.toString());

            const url = `${API_BASE_URL}/message/users/lender/contacts/${userId}?${searchParams.toString()}`;

            return await ky.get(url).json<GetUserContactsResponse>();
        } catch (error) {
            const err = error as HTTPError;
            const errorMessage = await err.response?.text();
            toast.error(`Failed to fetch contacts: ${errorMessage || err.message}`);
            throw error;
        }
    };

    const query = useQuery<GetUserContactsResponse, Error>({
        queryKey: ["userContacts", userId, cursor, limit],
        queryFn: () => getUserContactsApi(userId, cursor, limit),
        enabled: enabled && !!userId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        contacts: query.data?.data ?? [],
        nextCursor: query.data?.pagination?.next_cursor ?? null,
        hasMore: query.data?.pagination?.has_more ?? false,
        message: query.data?.message ?? "",
    };
};




export const useMarkAsSeenMessages = () => {
    const queryClient = useQueryClient();

    const markMessagesAsSeenRequest = async (
        conversationId: string,
        userId: string
    ): Promise<MarkMessagesAsSeenResponse> => {
        try {
            const response = await axios.patch<MarkMessagesAsSeenResponse>(
                `${API_BASE_URL}/message/users/contacts/messages/seen/${conversationId}?userId=${userId}`,
                {},
                { headers: { "Content-Type": "application/json" } }
            );
            return response.data;
        } catch (error) {
            console.error("Mark messages as seen error:", error);
            let errorMessage = "Failed to mark messages as seen.";
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || error.response?.data?.error || errorMessage;
            }
            throw new Error(errorMessage);
        }
    };

    const mutation = useMutation<MarkMessagesAsSeenResponse, Error, { conversationId: string; userId: string }>({
        mutationFn: ({ conversationId, userId }) => markMessagesAsSeenRequest(conversationId, userId),
        onSuccess: (data, variables) => {
            // Invalidate userContacts query to refresh the contacts list
            queryClient.invalidateQueries({ queryKey: ["userContacts", variables.userId] });
        },
        onError: (error) => {
            console.error("Marking messages as seen failed:", error);
            toast.error(error.message || "Failed to mark messages as seen.");
        },
    });

    return {
        markMessagesAsSeen: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
    };
};




// Define the request payload type based on the backend schema
interface SendMessagePayload {
    message: string;
    sender_id: string;
    sender_username: string;
    receiver_id: string;
    receiver_username: string;
    message_type?: 'text' | 'system';
    user1_id: string;
    user2_id: string;
}

// Define the expected response type from the backend
interface SendMessageResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        message: string;
        sender_id: string;
        sender_username: string;
        receiver_id: string;
        receiver_username: string;
        timestamp: string;
        message_type: 'text' | 'system';
        is_read: boolean;
        is_seen: boolean;
    };
    errors?: Array<{ path: string; message: string }>;
}

// Custom error type for API failures
interface ApiError {
    response?: {
        data: SendMessageResponse;
        status: number;
    };
    message: string;
}

export const useSendMessage = () => {
    // API request function for sending a message
    const sendMessageApiRequest = async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
        try {
            const response = await axiosApiClient.post('/messages/send-message', payload);
            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            if (apiError.response?.data) {
                throw apiError.response.data;
            }
            throw {
                success: false,
                message: 'Network error or server is unreachable',
            };
        }
    };

    // Use React Query's useMutation for handling the API call
    const mutation = useMutation<SendMessageResponse, SendMessageResponse, SendMessagePayload>({
        mutationFn: sendMessageApiRequest,
        onSuccess: (data) => {
            // Handle success - show toast or perform other actions
            if (data.success) {
                toast.success(data.message || 'Message sent successfully');
            }
        },
        onError: (error) => {
            // Handle error - show error toast
            toast.error(error.message || 'Failed to send message');
            console.error('Error sending message:', error);
        },
    });

    // Function to trigger the message sending
    const sendMessage = (payload: SendMessagePayload) => {
        return mutation.mutate(payload);
    };

    return {
        sendMessage, // Function to trigger the API call
        isLoading: mutation.isPending, // Loading state
        isError: mutation.isError, // Error state
        error: mutation.error, // Error object if any
        data: mutation.data, // Response data if successful
        isSuccess: mutation.isSuccess, // Success state
    };
};


