import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Message {
    id: string;
    conversation_id: string;
    message: string;
    sender_id: string;
    sender_username: string;
    receiver_id: string;
    receiver_username: string;
    message_type: 'text' | 'image';
    timestamp: string;
    is_read: boolean;
    image_url?: string;
}

interface MessageStore {
    // State
    conversations: Record<string, Message[]>;
    isLoading: boolean;
    error: string | null;

    // Actions
    setMessages: (conversationId: string, messages: Message[]) => void;
    getMessages: (conversationId: string) => Message[];
    addMessage: (conversationId: string, message: Message) => void;
    addOptimisticMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    removeMessage: (conversationId: string, messageId: string) => void;
    markMessagesAsRead: (conversationId: string, userId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearConversations: () => void;
}

const useMessageStore = create<MessageStore>()(
    devtools(
        (set, get) => ({
            conversations: {},
            isLoading: false,
            error: null,

            setMessages: (conversationId, messages) => {
                set(
                    (state) => ({
                        conversations: {
                            ...state.conversations,
                            [conversationId]: [...messages].sort(
                                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            ),
                        },
                    }),
                    false,
                    `setMessages-${conversationId}`
                );
            },

            getMessages: (conversationId) => {
                return get().conversations[conversationId] || [];
            },

            addMessage: (conversationId, message) => {
                set(
                    (state) => {
                        const existingMessages = state.conversations[conversationId] || [];

                        // Check if message already exists
                        const messageExists = existingMessages.some((msg) => msg.id === message.id);
                        if (messageExists) {
                            console.log('Message already exists, skipping:', message.id);
                            return state;
                        }

                        console.log('Adding message to store:', message.id);

                        // Add message and sort by timestamp
                        const updatedMessages = [...existingMessages, message].sort(
                            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedMessages,
                            },
                        };
                    },
                    false,
                    `addMessage-${conversationId}-${message.id}`
                );
            },

            addOptimisticMessage: (conversationId, message) => {
                set(
                    (state) => {
                        const existingMessages = state.conversations[conversationId] || [];
                        console.log('Adding optimistic message:', message.id);

                        const updatedMessages = [...existingMessages, message].sort(
                            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedMessages,
                            },
                        };
                    },
                    false,
                    `addOptimisticMessage-${conversationId}`
                );
            },

            updateMessage: (conversationId, messageId, updates) => {
                set(
                    (state) => {
                        const messages = state.conversations[conversationId];
                        if (!messages) return state;

                        const updatedMessages = messages.map((msg) =>
                            msg.id === messageId ? { ...msg, ...updates } : msg
                        );

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedMessages,
                            },
                        };
                    },
                    false,
                    `updateMessage-${conversationId}-${messageId}`
                );
            },

            removeMessage: (conversationId, messageId) => {
                set(
                    (state) => {
                        const messages = state.conversations[conversationId];
                        if (!messages) return state;

                        const updatedMessages = messages.filter((msg) => msg.id !== messageId);

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedMessages,
                            },
                        };
                    },
                    false,
                    `removeMessage-${conversationId}-${messageId}`
                );
            },

            markMessagesAsRead: (conversationId, userId) => {
                set(
                    (state) => {
                        const messages = state.conversations[conversationId];
                        if (!messages) return state;

                        const updatedMessages = messages.map((msg) => ({
                            ...msg,
                            is_read: msg.sender_id !== userId ? true : msg.is_read,
                        }));

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedMessages,
                            },
                        };
                    },
                    false,
                    `markMessagesAsRead-${conversationId}`
                );
            },

            setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
            setError: (error) => set({ error }, false, 'setError'),
            clearConversations: () => set({ conversations: {} }, false, 'clearConversations'),
        }),
        {
            name: 'message-store',
        }
    )
);

export default useMessageStore;

// Selectors
export const useConversationMessages = (conversationId: string) => {
    return useMessageStore((state) => state.conversations[conversationId] || []);
};

export const useIsLoading = () => useMessageStore((state) => state.isLoading);
export const useError = () => useMessageStore((state) => state.error);

// Helper functions
export const addMessageToConversation = (conversationId: string, message: Message) => {
    useMessageStore.getState().addMessage(conversationId, message);
};

export const addOptimisticMessageToConversation = (conversationId: string, message: Message) => {
    useMessageStore.getState().addOptimisticMessage(conversationId, message);
};

export const updateMessageInConversation = (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
) => {
    useMessageStore.getState().updateMessage(conversationId, messageId, updates);
};

export const removeMessageFromConversation = (conversationId: string, messageId: string) => {
    useMessageStore.getState().removeMessage(conversationId, messageId);
};