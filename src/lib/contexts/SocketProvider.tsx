"use client";

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import { addMessageToConversation } from '@/lib/zustand/messageStore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TypingStatus {
  conversation_id: string;
  user_id: string;
  username: string;
  is_typing: boolean;
}

interface MessageData {
  conversation_id: string;
  message: string;
  sender_id: string;
  sender_username: string;
  receiver_id: string;
  receiver_username: string;
  image_url?: string;
  message_type?: 'text' | 'image';
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, TypingStatus>;
  sendMessage: (data: MessageData) => boolean;
  sendTypingStatus: (data: {
    conversation_id: string;
    user_id: string;
    username: string;
    is_typing: boolean;
    receiver_id: string;
  }) => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map());

  const { isAuthenticated, user, userRolesData } = useSupabaseAuth();

  // Handle new message from socket
  const handleNewMessage = useCallback((messageData: any) => {
    console.log('📬 New message received:', messageData);

    if (!messageData?.conversation_id || !messageData?.id) {
      console.error('❌ Invalid message data:', messageData);
      return;
    }

    try {
      addMessageToConversation(messageData.conversation_id, messageData);
    } catch (error) {
      console.error('❌ Error adding message to store:', error);
    }
  }, []);

  // Handle typing status updates
  const handleTypingStatus = useCallback((data: TypingStatus) => {
    console.log('⌨️ Typing status update:', data);

    setTypingUsers(prev => {
      const newMap = new Map(prev);

      if (data.is_typing) {
        newMap.set(data.conversation_id, data);
      } else {
        newMap.delete(data.conversation_id);
      }

      return newMap;
    });
  }, []);

  // Handle online users updates
  const handleOnlineUsers = useCallback((data: { users: string[]; count: number }) => {
    console.log(`👥 Online users updated: ${data.count} users online`);
    setOnlineUsers(data.users);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socket) {
        console.log('🔒 User not authenticated, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers(new Map());
      }
      return;
    }

    const userId = user.id;
    const username = userRolesData?.username || user?.email || 'Unknown';

    console.log('🔌 Initializing socket connection for user:', userId);

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000', {
      query: { userId, username },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('🟢 Connected to WebSocket server. Socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Disconnected from WebSocket server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    // Event handlers
    newSocket.on('welcome', (data) => {
      console.log('👋 Welcome message:', data);
    });

    newSocket.on('onlineUsers', handleOnlineUsers);
    newSocket.on('newMessage', handleNewMessage);
    newSocket.on('userTypingStatus', handleTypingStatus);

    newSocket.on('messageDelivered', (data) => {
      console.log('📨 Message delivery confirmation:', data);
    });

    newSocket.on('messageError', (data) => {
      console.error('❌ Message error:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up socket connection');
      newSocket.off('onlineUsers', handleOnlineUsers);
      newSocket.off('newMessage', handleNewMessage);
      newSocket.off('userTypingStatus', handleTypingStatus);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers(new Map());
    };
  }, [isAuthenticated, user?.id, userRolesData?.username, handleNewMessage, handleTypingStatus, handleOnlineUsers]);

  // Send message function
  const sendMessage = useCallback((data: MessageData): boolean => {
    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected. Cannot send message.');
      return false;
    }

    if (!data.conversation_id || !data.message || !data.sender_id || !data.receiver_id) {
      console.error('❌ Missing required fields for sendMessage');
      return false;
    }

    try {
      const messagePayload = {
        conversation_id: data.conversation_id,
        message: data.message,
        sender_id: data.sender_id,
        sender_username: data.sender_username,
        receiver_id: data.receiver_id,
        receiver_username: data.receiver_username,
        message_type: data.message_type || 'text'
      };

      console.log('📤 Sending message:', messagePayload);
      socket.emit('sendMessage', messagePayload);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }, [socket, isConnected]);

  // Send typing status function
  const sendTypingStatus = useCallback((data: {
    conversation_id: string;
    user_id: string;
    username: string;
    is_typing: boolean;
    receiver_id: string;
  }): boolean => {
    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected. Cannot send typing status.');
      return false;
    }

    if (!data.conversation_id || !data.user_id || !data.receiver_id) {
      console.error('❌ Missing required fields for typing status');
      return false;
    }

    try {
      const typingPayload = {
        conversation_id: data.conversation_id,
        user_id: data.user_id,
        username: data.username,
        is_typing: data.is_typing,
        receiver_id: data.receiver_id,
        timestamp: new Date().toISOString()
      };

      socket.emit('userTyping', typingPayload);
      console.log(`✅ Typing status sent: ${data.is_typing ? 'typing' : 'stopped typing'}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending typing status:', error);
      return false;
    }
  }, [socket, isConnected]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingStatus
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};