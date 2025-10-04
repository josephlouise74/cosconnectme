// hooks/useGetMyNotifications.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosApiClient } from "./axiosApiClient";
import { toast } from "sonner";


// types/notifications.ts

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";
export type NotificationType =
    | "NEW_COSTUME"
    | "COMMUNITY_POST"
    | "USER_SIGN_IN"
    | "RENTAL_REQUEST"
    | "RENTAL_APPROVED"
    | "RENTAL_REJECTED"
    | "RENTAL_UPDATED"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "PAYMENT_REMINDER"
    | "NEW_MESSAGE"
    | "SYSTEM_ALERT"
    | "LENDER_VERIFICATION_PENDING"
    | "LENDER_VERIFICATION_APPROVED"
    | "LENDER_VERIFICATION_REJECTED"
    | "ACCOUNT_SUSPENDED"
    | "ACCOUNT_REACTIVATED";

export type RecipientRole = "borrower" | "lender" | "admin";

export interface NotificationMetadata {
    isForSale?: boolean;
    authorName?: string;
    contentPreview?: string;
    [key: string]: unknown;
}

export interface NotificationItem {
    id: string;
    recipient_id: string;
    recipient_role: RecipientRole;
    recipient_email: string;
    sender_id: string | null;
    sender_role: RecipientRole | null;
    sender_type: "user" | "admin" | "system" | null;
    type: NotificationType;
    status: NotificationStatus;
    title: string;
    message: string;
    costume_id: string | null;
    post_id: string | null;
    rental_id: string | null;
    payment_id: string | null;
    message_id: string | null;
    metadata: NotificationMetadata;
    created_at: string; // ISO timestamp
    read_at: string | null;
    archived_at: string | null;
    expires_at: string | null;
    updated_at: string; // ISO timestamp
    is_deleted: boolean;
}

export interface NotificationsPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetNotificationsResponse {
    success: boolean;
    data: {
        items: NotificationItem[];
        pagination: NotificationsPagination;
    };
}


export const useGetMyNotifications = (
    role: string,
    email: string,
    page: number = 1,
    limit: number = 10
) => {
    const getMyNotificationsApiRequest = async (): Promise<GetNotificationsResponse> => {
        const response = await axiosApiClient.get<GetNotificationsResponse>(
            "/notifications/get-my-notifications",
            {
                params: { role, email, page, limit },
            }
        );
        return response.data;
    };

    return useQuery<GetNotificationsResponse>({
        queryKey: ["my-notifications", role, email, page, limit],
        queryFn: getMyNotificationsApiRequest,
        retry: 0,
        retryDelay: 0,

    });
};



// ============================
// DELETE a single notification
// ============================
export const useDeleteNotification = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosApiClient.delete<{ success: boolean; message: string }>(`/notifications/delete-notification/${id}`)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data.message || "Notification deleted")
            queryClient.invalidateQueries({ queryKey: ["my-notifications"] }) // ✅ refresh cache
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to delete notification"
            toast.error(message)
        },
    })
}

// ===================================
// GET unread notification count
// ===================================
export const useGetUnreadNotificationCount = (role: string, email: string) => {
    const getUnreadCountApiRequest = async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
        const response = await axiosApiClient.get<{ success: boolean; data: { unreadCount: number } }>(
            "/notifications/unread-count",
            {
                params: { role, email },
            }
        );
        return response.data;
    };

    return useQuery<{ success: boolean; data: { unreadCount: number } }>({
        queryKey: ["unread-notification-count", role, email],
        queryFn: getUnreadCountApiRequest,
        retry: 0,
        retryDelay: 0,
        refetchInterval: 3000, // Refetch every 30 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

// ===================================
// MARK a single notification as READ
// ===================================
export const useMarkAsReadNotification = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosApiClient.patch<{ success: boolean; data: any }>(`/notifications/mark-as-read/${id}`)
            return response.data
        },
        onSuccess: () => {
            toast.success("Notification marked as read")
            queryClient.invalidateQueries({ queryKey: ["my-notifications"] })
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to mark notification as read"
            toast.error(message)
        },
    })
}

// ===================================
// MARK ALL notifications as READ
// ===================================
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { userId: string; role: string }) => {
            const response = await axiosApiClient.patch<{ success: boolean; message: string }>(
                `/notifications/mark-all-as-read`,
                params,
            )
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data.message || "All notifications marked as read")
            queryClient.invalidateQueries({ queryKey: ["my-notifications"] })
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to mark all as read"
            toast.error(message)
        },
    })
}