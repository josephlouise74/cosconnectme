export type PostItem = {
    id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    author_avatar: string;
    content: string;
    images: string[];
    is_for_sale: boolean;
    heart_count: number;
    likes: number;
    is_liked: boolean;
    created_at: string;
    updated_at: string;
    comment_count: number;
};

export type PaginationMeta = {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
};

export type AllPostsResponse = {
    success: boolean;
    data: PostItem[];
    pagination: PaginationMeta;
};