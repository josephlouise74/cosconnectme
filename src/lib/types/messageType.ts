export interface MessageInquiryPayload {
    conversationId: string;
    costumeName: string;
    lenderId: string;
    lenderUsername: string;
    borrowerId: string;
    borrowerUsername: string;
    costumeId: string;
    timestamp: string; // ISO format
}


export type MessageType = "inquiry" | "text" | "system"; // Extend as needed

export interface SendMessageDataType {
    conversation_id: string;
    message: string;
    message_type: string;
    receiver_id: string;
    receiver_username: string;
    sender_id: string;
    user1_id: string;
    user2_id: string;
    sender_username: string;
    timestamp: string; // or `Date` if you parse it
    costume_id?: string;
    costume_name?: string;
}


export interface MarkMessagesAsSeenResponse {
    success: boolean;
    data: {
        conversation_id: string;
        updated_messages_count: number;
        updated_messages: Array<{
            id: string;
            conversation_id: string;
            is_read: boolean;
            is_seen: boolean;
        }>;
    };
    message: string;
}
