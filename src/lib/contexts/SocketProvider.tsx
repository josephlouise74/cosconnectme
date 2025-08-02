/* "use client";

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import { IncomingSocketMessage, UserInfo } from '@/types/ConversationType';
import { addMessageToConversation } from '@/zustand/messageStore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TypingStatus {
  conversation_id: string;
  user_id: string;
  username: string;
  is_typing: boolean;
  profile_image?: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, TypingStatus>;
  sendMessage: (data: {
    conversation_id: string;
    message: string;
    sender_id: string;
    sender_username: string;
    message_type?: string;
    receiver_id: string;
    receiver_username: string;
    costume_id?: string;
    costume_name?: string;
    profile_image?: string;
  }) => void;
  sendTypingStatus: (data: {
    conversation_id: string;
    user_id: string;
    username: string;
    is_typing: boolean;
    receiver_id: string;
    profile_image?: string;
  }) => void;
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


  // Memoized typing status handler
  // Memoized message handler to prevent re-registration
  const handleNewMessage = useCallback((messageData: IncomingSocketMessage) => {
    console.log('📬 New message received via socket:', messageData);

    // Validate message data
    if (!messageData || !messageData.conversation_id || !messageData.id) {
      console.error('❌ Invalid message data received:', messageData);
      return;
    }

    // Create minimal sender_info and receiver_info
    const sender_info: UserInfo = {
      uid: messageData.sender_id,
      first_name: null,
      last_name: null,
      email: '',
      username: messageData.sender_username,
      profile_image: messageData.profile_image || ''
    };
    const receiver_info: UserInfo = {
      uid: messageData.receiver_id,
      first_name: null,
      last_name: null,
      email: '',
      username: messageData.receiver_username,
      profile_image: ''
    };

    try {
      // Add message to store using the helper function
      addMessageToConversation(messageData.conversation_id, messageData, sender_info, receiver_info);

    } catch (error) {
      console.error('❌ Error adding message to store:', error);
    }
  }, []);

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

  // Memoized online users handler
  const handleOnlineUsers = useCallback((data: { users: string[], count: number }) => {
    console.log(`👥 Online users updated: ${data.count} users online`);
    setOnlineUsers(data.users);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const userId = user.id;
      const username = userRolesData?.username || user?.email || 'Unknown';

      console.log('🔌 Initializing socket connection for user:', userId);
      console.log('👤 Username:', username);

      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000', {
        query: {
          userId: userId,
          username: username,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection event handlers
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

      // Welcome message from server
      newSocket.on('welcome', (data) => {
        console.log('👋 Welcome message:', data);
      });

      // Register event handlers
      newSocket.on('onlineUsers', handleOnlineUsers);
      newSocket.on('newMessage', handleNewMessage);
      newSocket.on('userTypingStatus', handleTypingStatus);

      // Message delivery confirmations
      newSocket.on('messageDelivered', (data) => {
        console.log('📨 Message delivery confirmation:', data);
      });

      // Message read receipts
      newSocket.on('messageRead', (data) => {
        console.log('👁️ Message read receipt:', data);
      });

      // Health check response
      newSocket.on('pong', (data) => {
        console.log('🏓 Pong received:', data);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up socket connection');

        // Remove event listeners
        newSocket.off('onlineUsers', handleOnlineUsers);
        newSocket.off('newMessage', handleNewMessage);
        newSocket.off('userTypingStatus', handleTypingStatus);

        // Disconnect and cleanup
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers(new Map());
      };
    } else {
      // Clean up socket if user is not authenticated
      if (socket) {
        console.log('🔒 User not authenticated, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers(new Map());
      }
    }
    return
  }, [isAuthenticated, user, userRolesData, handleNewMessage, handleTypingStatus, handleOnlineUsers]);

  // Send message function
  const sendMessage = useCallback((data: {
    conversation_id: string;
    message: string;
    sender_id: string;
    sender_username: string;
    message_type?: string;
    receiver_id: string;
    receiver_username: string;
    costume_id?: string;
    costume_name?: string;
    profile_image?: string;
  }) => {
    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected. Cannot send message.');
      console.log('🔍 Debug info:', {
        socket: !!socket,
        isConnected,
        socketId: socket?.id
      });
      return false;
    }

    // Validate required fields
    if (!data.conversation_id || !data.message || !data.sender_id || !data.receiver_id) {
      console.error('❌ Missing required fields for sendMessage:', {
        conversation_id: !!data.conversation_id,
        message: !!data.message,
        sender_id: !!data.sender_id,
        receiver_id: !!data.receiver_id
      });
      return false;
    }

    try {
      const messagePayload: any = {
        conversation_id: data.conversation_id,
        message: data.message,
        sender_id: data.sender_id,
        sender_username: data.sender_username,
        receiver_id: data.receiver_id,
        receiver_username: data.receiver_username,
        message_type: data.message_type || 'text',
        timestamp: new Date().toISOString()
      };
      if (data.costume_id) messagePayload.costume_id = data.costume_id;
      if (data.costume_name) messagePayload.costume_name = data.costume_name;
      if (data.profile_image) messagePayload.profile_image = data.profile_image;

      console.log('📤 Sending message payload:', messagePayload);
      socket.emit('sendMessage', messagePayload);
      console.log('✅ Message sent successfully');
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
    profile_image?: string;
  }) => {
    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected. Cannot send typing status.');
      return false;
    }

    // Validate required fields
    if (!data.conversation_id || !data.user_id || !data.receiver_id) {
      console.error('❌ Missing required fields for typing status:', {
        conversation_id: !!data.conversation_id,
        user_id: !!data.user_id,
        receiver_id: !!data.receiver_id
      });
      return false;
    }

    try {
      const typingPayload = {
        conversation_id: data.conversation_id,
        user_id: data.user_id,
        username: data.username,
        is_typing: data.is_typing,
        profile_image: data.profile_image,
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
}; */