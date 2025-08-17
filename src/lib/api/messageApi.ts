
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import ky, { HTTPError } from "ky"
import { toast } from "sonner"
import { MarkMessagesAsSeenResponse, MessageInquiryPayload, SendMessageDataType } from "../types/messageType"

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


export const useSendMessage = () => {

    const sendMessageApiRequest = async (payload: SendMessageDataType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/message/send-message`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            return response.data
        } catch (error) {
            console.error("Send message error:", error)
            let errorMessage = "Failed to send message."
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || error.response?.data?.error || errorMessage
            }
            throw new Error(errorMessage)
        }
    }

    const mutation = useMutation({
        mutationFn: sendMessageApiRequest,
        onError: (error: Error) => {
            console.error("Message sending failed:", error);
            toast.error(error.message || "Failed to send message.");
        },
    })

    return {
        sendMessage: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
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
