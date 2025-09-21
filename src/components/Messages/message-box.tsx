"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSocket } from '@/lib/contexts/SocketProvider';
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, CheckCheck } from 'lucide-react';
import MessageInput from './message-input';
import { useSendMessage } from '@/lib/api/messageApi';

// Types
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

interface Conversation {
    id: string | number; // Updated to support string IDs from API
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

interface MessageFormData {
    message: string;
}

interface MessageBoxProps {
    activeConversationId: string | number; // Updated to support string IDs from API
    conversations: Conversation[];
    messagesData: Record<string | number, Message[]>;
    onSendMessage: (conversationId: string | number, message: Message) => void;
    isSending?: boolean; // Added to handle loading state from API
}

export const MessageBox: React.FC<MessageBoxProps> = ({
    activeConversationId,
    conversations,
    messagesData,
    onSendMessage,
    isSending = false
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { isAuthenticated, user } = useSupabaseAuth();
    const { socket, isConnected, typingUsers, sendTypingStatus } = useSocket();
    const { sendMessage: sendMessageApi, isLoading: isApiSending } = useSendMessage(); // Integrate API hook
    const form = useForm<MessageFormData>({
        defaultValues: {
            message: ''
        }
    });

    // Get active conversation
    const activeConversation = conversations.find(conv => conv.id === activeConversationId);
    const messages = messagesData[activeConversationId] || [];
    const userId = user?.id || "";

    // Get receiver info for the active conversation
    const receiverId = activeConversation?.user2_id || '';
    const receiverUsername = activeConversation?.name || '';

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle form submission using API
    const handleSubmit = useCallback(async (data: MessageFormData) => {
        if (!data.message.trim() || !isAuthenticated || !userId || !activeConversation) {
            return;
        }

        // Create local message for immediate UI update (optimistic update)
        const localMessage: Message = {
            id: 'temp-id-' + Date.now(), // Temporary ID until API response
            message: data.message,
            text: data.message,
            sent: true,
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: new Date(),
            conversation_id: activeConversationId.toString(),
            sender_id: userId,
            sender_username: user?.user_metadata?.username || 'Unknown',
            status: 'sent'
        };

        // Update local state optimistically
        onSendMessage(activeConversationId, localMessage);

        // Prepare payload for API call
        const payload = {
            message: data.message,
            sender_id: userId,
            sender_username: user?.user_metadata?.username || 'Unknown User',
            receiver_id: receiverId,
            receiver_username: receiverUsername,
            message_type: 'text' as const,
            user1_id: activeConversation.user1_id || userId,
            user2_id: receiverId
        };

        // Send message via API
        sendMessageApi(payload);

        // Reset form
        form.reset();
    }, [
        isAuthenticated,
        userId,
        user,
        activeConversation,
        activeConversationId,
        receiverId,
        receiverUsername,
        onSendMessage,
        sendMessageApi,
        form
    ]);

    // Handle typing indicator
    const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthenticated || !userId || !activeConversation) return;
        const isTyping = e.target.value.length > 0;

        // Send typing status via socket
        sendTypingStatus({
            conversation_id: activeConversationId.toString(),
            user_id: userId,
            username: user?.user_metadata?.username || 'Unknown',
            is_typing: isTyping,
            receiver_id: receiverId
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStatus({
                    conversation_id: activeConversationId.toString(),
                    user_id: userId,
                    username: user?.user_metadata?.username || 'Unknown',
                    is_typing: false,
                    receiver_id: receiverId
                });
            }, 1000);
        }
    }, [
        isAuthenticated,
        userId,
        user,
        activeConversation,
        activeConversationId,
        receiverId,
        sendTypingStatus
    ]);

    // Handle image upload (unchanged as it’s a placeholder)
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            // Placeholder for image upload logic
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Image upload would happen here:', file);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Get typing status for current conversation
    const currentTypingStatus = typingUsers.get(activeConversationId.toString());
    const isOtherUserTyping = currentTypingStatus?.is_typing &&
        currentTypingStatus?.user_id !== userId;

    // Render message status icon
    const renderMessageStatus = (message: Message) => {
        if (!message.sent) return null;
        switch (message.status) {
            case 'sent':
                return <Check className="h-3 w-3 text-muted-foreground" />;
            case 'delivered':
                return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
            case 'read':
                return <CheckCheck className="h-3 w-3 text-blue-500" />;
            default:
                return <Clock className="h-3 w-3 text-muted-foreground" />;
        }
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center text-muted-foreground">
                    <p className="text-lg">Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="border-b border-border bg-background p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={activeConversation.avatar} alt={activeConversation.name} />
                        <AvatarFallback>
                            {activeConversation.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                                {activeConversation.name}
                            </h3>
                            {activeConversation.isGroup && (
                                <Badge variant="secondary" className="text-xs">
                                    Group
                                </Badge>
                            )}
                        </div>
                        {isConnected && (
                            <p className="text-sm text-muted-foreground">
                                {isOtherUserTyping ? (
                                    <span className="text-green-600">
                                        {currentTypingStatus?.username} is typing...
                                    </span>
                                ) : (
                                    'Online'
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => {
                        const messageText = message.message || message.text || '';
                        const isOwnMessage = message.sent;
                        return (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isOwnMessage && (
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarImage src={activeConversation.avatar} />
                                        <AvatarFallback className="text-xs">
                                            {activeConversation.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                    {!isOwnMessage && activeConversation.isGroup && (
                                        <span className="text-xs text-muted-foreground px-1">
                                            {message.sender_username || activeConversation.name}
                                        </span>
                                    )}
                                    <div className={`
                    rounded-2xl px-4 py-2 max-w-full break-words
                    ${isOwnMessage
                                            ? 'bg-rose-600 text-white rounded-br-md'
                                            : 'bg-muted text-foreground rounded-bl-md'
                                        }
                  `}>
                                        {message.imageUrl && (
                                            <img
                                                src={message.imageUrl}
                                                alt="Shared image"
                                                className="max-w-full h-auto rounded-lg mb-2"
                                            />
                                        )}
                                        {messageText && (
                                            <p className="text-sm leading-relaxed">{messageText}</p>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-xs text-muted-foreground">
                                            {message.time}
                                        </span>
                                        {renderMessageStatus(message)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Typing indicator */}
                    {isOtherUserTyping && (
                        <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={activeConversation.avatar} />
                                <AvatarFallback className="text-xs">
                                    {activeConversation.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </ScrollArea>
            {/* Message Input */}
            <MessageInput
                form={form}
                onSubmit={handleSubmit}
                isUploading={isUploading}
                isLoading={isSending || isApiSending} // Use combined loading state from props and API hook
                fileInputRef={fileInputRef}
                handleImageUpload={handleImageUpload}
                handleTyping={handleTyping}
            />
        </div>
    );
};