
export type PostItem = {
    id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    author_avatar: string;
    content: string;
    images: string[];
    heart_count: number;
    likes: number;
    is_liked: boolean;
    created_at: string;
    updated_at: string;
    comment_count: number;
};

export type PaginationMeta = {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
    count: number;

};
export type AllPostsResponse = {
    success: boolean;
    data: PostItem[];
    pagination: PaginationMeta;
    message: string;
};
