"use client";
import { useState } from 'react';
import { Search, MoreVertical, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Import the Conversation type aligned with API data (or define it here if not exported elsewhere)
interface Conversation {
    id: string | number; // Updated to handle string IDs from API
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

interface MessageSideBarProps {
    conversations: Conversation[];
    activeConversationId: string | number; // Updated to handle string IDs from API
    onConversationSelect: (id: string | number) => void;
    className?: string;
}

const ConversationItem = ({
    conversation,
    isActive,
    onClick
}: {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center p-3 hover:bg-accent/50 transition-colors text-left group relative",
                isActive && "bg-accent border-r-2 border-primary"
            )}
        >
            <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage
                        src={conversation.avatar}
                        alt={conversation.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {conversation.unread > 0 && (
                    <Badge
                        variant="default"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-2 border-background"
                    >
                        {conversation.unread > 99 ? '99+' : conversation.unread}
                    </Badge>
                )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                        "font-medium truncate pr-2 text-sm",
                        isActive ? "text-foreground" : "text-foreground",
                        conversation.unread > 0 && !isActive && "font-semibold"
                    )}>
                        {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                        {conversation.time}
                    </span>
                </div>
                <div className="flex items-center">
                    {conversation.isGroup && (
                        <MessageCircle className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
                    )}
                    <p className={cn(
                        "text-xs truncate",
                        conversation.unread > 0 && !isActive
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                    )}>
                        {conversation.lastMessage}
                    </p>
                </div>
            </div>
        </button>
    );
};

export const MessageSideBar = ({
    conversations,
    activeConversationId,
    onConversationSelect,
    className
}: MessageSideBarProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter conversations based on search term
    const filteredConversations = conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate total unread messages for badge
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

    return (
        <aside className={cn("w-80 border-r border-border flex flex-col bg-background", className)}>
            {/* Header */}
            <header className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-foreground">Messages</h1>
                        {totalUnread > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {totalUnread > 99 ? '99+' : totalUnread}
                            </Badge>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                    </Button>
                </div>
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        className="pl-10 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>
            {/* Conversation List */}
            <ScrollArea className="flex-1">
                <div className="py-2">
                    {filteredConversations.length === 0 ? (
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {searchTerm ? 'No conversations found' : 'No conversations yet'}
                            </p>
                            {searchTerm && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try searching for a different term
                                </p>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isActive={activeConversationId === conversation.id}
                                onClick={() => onConversationSelect(conversation.id)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
};