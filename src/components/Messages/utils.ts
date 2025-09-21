// utils.ts
import { z } from 'zod';

export const messageSchema = z.object({
    message: z.string().optional(),
    image: z.instanceof(File).optional().nullable(),
}).refine(
    (data) => data.message?.trim() || data.image,
    {
        message: "Either message or image is required",
        path: ["message"],
    }
);

export type MessageFormData = z.infer<typeof messageSchema>;

export interface Message {
    id: number;
    text?: string;
    imageUrl?: string;
    imagePath?: string; // For Supabase storage path
    sent: boolean;
    time: string;
    timestamp: Date;
    isUploading?: boolean; // For showing upload state
}

export interface Conversation {
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string;
    isGroup?: boolean;
}

export interface ImageUploadResponse {
    url: string | null;
    error: string | null;
    filePath: string | null;
}