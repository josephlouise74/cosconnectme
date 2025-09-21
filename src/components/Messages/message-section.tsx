"use client";
import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/lib/contexts/SocketProvider';
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';

import { MessageSideBar } from './MessageSidebar';
import { MessageBox } from './message-box';
import { Contact, useGetContacts, useSendMessage } from '@/lib/api/messageApi';

// Types
interface Conversation {
    id: string | number;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string;
    isGroup?: boolean;
    participants?: string[];
    user1_id?: string;
    user2_id?: string;
}

interface Message {
    id: string | number;
    text?: string;
    message?: string;
    imageUrl?: string;
    sent: boolean;
    time: string;
    timestamp?: Date;
    conversation_id?: string;
    sender_id?: string;
    sender_username?: string;
    status?: 'sent' | 'delivered' | 'read';
}

export default function MessageSection() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | number>("");
    const [messagesData, setMessagesData] = useState<Record<string | number, Message[]>>({}); // Updated to support string IDs

    const { isAuthenticated, user } = useSupabaseAuth();
    const { socket } = useSocket();
    const { sendMessage, isLoading: isSending, isError: isSendError, error: sendError, data: sendData } = useSendMessage();

    // Fetch contacts using the API hook
    const userId = user?.id || ""; // Handle potential null by providing an empty string as fallback
    const { data: contactsData, isLoading: isLoadingContacts, isError: isContactsError, error: contactsError, isSuccess: isContactsSuccess } = useGetContacts({
        userId,
        limit: 20, // Default limit, can be adjusted
    });

    // Map fetched contacts to conversations once data is available
    useEffect(() => {
        if (isContactsSuccess && contactsData?.success && contactsData.data.length > 0) {
            const mappedConversations = contactsData.data.map((contact: Contact) => ({
                id: contact.id,
                name: contact.partner_info.username || "Unknown User",
                lastMessage: contact.message,
                time: new Date(contact.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                unread: contact.un_read_count,
                avatar: contact.partner_info.profile_image || '/avatars/default.jpg',
                isGroup: false, // Assuming 1:1 chat for now; adjust if groups are supported
                user1_id: userId,
                user2_id: contact.partner_info.uid,
            }));
            setConversations(mappedConversations);

            // Set the first conversation as active if none is selected
            if (activeConversationId === "" && mappedConversations.length > 0) {
                setActiveConversationId(mappedConversations[0]?.id);
            }
        }
    }, [isContactsSuccess, contactsData, userId, activeConversationId]);

    // Handle new messages from socket (for real-time receiving)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (messageData: any) => {
            console.log('📬 Received new message:', messageData);
            if (!messageData?.id) {
                console.error('❌ Invalid message data:', messageData);
                return;
            }

            const newMessage: Message = {
                id: messageData.id,
                message: messageData.message,
                text: messageData.message,
                sent: messageData.sender_id === userId,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(messageData.timestamp || Date.now()),
                conversation_id: messageData.conversation_id || activeConversationId.toString(),
                sender_id: messageData.sender_id,
                sender_username: messageData.sender_username,
                status: 'delivered'
            };

            // Add message to the active conversation
            setMessagesData(prev => ({
                ...prev,
                [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
            }));

            // Update conversation's last message and unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === activeConversationId
                        ? {
                            ...conv,
                            lastMessage: messageData.message,
                            time: 'now',
                            unread: conv.id === activeConversationId ? 0 : conv.unread + 1
                        }
                        : conv
                )
            );
        };

        socket.on('newMessage', handleNewMessage);
        return () => socket.off('newMessage', handleNewMessage);
    }, [socket, userId, activeConversationId]);

    // Handle conversation selection
    const handleConversationSelect = useCallback((id: string | number) => {
        console.log('💬 Selecting conversation:', id);
        setActiveConversationId(id);
        // Mark conversation as read
        setConversations(prev =>
            prev.map(conv =>
                conv.id === id ? { ...conv, unread: 0 } : conv
            )
        );
    }, []);

    // Handle sending new message using API
    const handleSendMessage = useCallback(
        (conversationId: string | number, message: Message) => {
            if (!userId) {
                console.error('❌ User not authenticated');
                return;
            }

            const activeConversation = conversations.find(conv => conv.id === conversationId);
            if (!activeConversation) {
                console.error('❌ Conversation not found');
                return;
            }

            // Optimistically update UI before API response
            console.log('📤 Adding message locally:', message);
            setMessagesData(prev => ({
                ...prev,
                [conversationId]: [...(prev[conversationId] || []), message]
            }));

            // Update conversation's last message in UI
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId
                        ? {
                            ...conv,
                            lastMessage: message.message || message.text || '',
                            time: 'now'
                        }
                        : conv
                )
            );

            // Prepare payload for API call
            const receiverId = activeConversation.user2_id || '';
            const receiverUsername = activeConversation.name || '';
            const payload = {
                message: message.message || message.text || '',
                sender_id: userId,
                sender_username: user?.user_metadata?.username || 'Unknown User',
                receiver_id: receiverId,
                receiver_username: receiverUsername,
                message_type: 'text' as const,
                user1_id: activeConversation.user1_id || userId,
                user2_id: receiverId
            };

            // Call API to send message
            sendMessage(payload);
        },
        [userId, user, conversations, sendMessage]
    );

    // Handle API response for sending messages (success or error)
    useEffect(() => {
        if (isSendError && sendError) {
            console.error('❌ Error sending message:', sendError);
            // Optionally revert optimistic update or notify user; logging for simplicity
        } else if (sendData && sendData.success && sendData.data) {
            console.log('✅ Message sent successfully via API:', sendData.data);
            // Update message ID and status based on API response
            setMessagesData((prev: any) => {
                const currentMessages = prev[activeConversationId] || [];
                return {
                    ...prev,
                    [activeConversationId]: currentMessages.map(msg =>
                        msg.id === 'temp-id' && msg.message === sendData.data?.message
                            ? { ...msg, id: sendData.data?.id, status: 'delivered' as const }
                            : msg
                    )
                };
            });
        }
    }, [sendData, isSendError, sendError, activeConversationId]);

    // Handle loading and error states for contacts fetching
    if (isLoadingContacts) {
        return <div className="flex h-screen items-center justify-center bg-background">Loading conversations...</div>;
    }

    if (isContactsError && contactsError) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                Error loading conversations: {contactsError.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <MessageSideBar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onConversationSelect={handleConversationSelect}
            />
            <MessageBox
                activeConversationId={activeConversationId}
                conversations={conversations}
                messagesData={messagesData}
                onSendMessage={handleSendMessage}
                isSending={isSending} // Pass loading state to disable button during API call
            />
        </div>
    );
}