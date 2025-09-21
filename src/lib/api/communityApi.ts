import { toast } from "sonner";
import { axiosApiClient } from "./axiosApiClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AllPostsResponse } from "../types/community/all-posts";
import axios from "axios";


export const useLikePost = () => {
    const likePostApiRequest = async (payload: any): Promise<any> => {
        console.log(payload)
        const response = await axiosApiClient.put<any>("/community/like-post", payload)
        toast.success(response.data.message || "Post updated successfully")
        return response.data
    }

    return useMutation({
        mutationFn: likePostApiRequest,
        onError: (error: unknown) => {
            let message = "Failed to like/unlike post"
            console.log(error)
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message
            }
            toast.error(message)
        },
        retry: 0,
        retryDelay: 0
    })
}


export interface CommentAuthor {
    user_id: string;
    username: string;
    avatar?: string;
    role?: string;
}

export interface CommentData {
    post_id: string;
    parent_comment_id: string | null;
    content: string;
    images?: string[];
    commenter: CommentAuthor;
}

export interface CommentResponse {
    id: string;
    post_id: string;
    content: string;
    images: string[];
    commenter: CommentAuthor;
    created_at: string;
    updated_at: string;
    likes: number;
    is_liked: boolean;
    reply_count: number;
}

export const useCreatePost = () => {
    const createPostApiRequest = async (data: any): Promise<any> => {
        try {
            console.log('Creating post with data:', data);
            const response = await axiosApiClient.post<any>('/community/create-post', data);
            toast.success("Post created successfully");
            return response.data;
        } catch (error: unknown) {
            let errorMessage = "Failed to create post";

            // Log the full error for debugging
            console.error('Error creating post:', error);

            if (axios.isAxiosError(error)) {
                // Handle Axios specific errors
                if (error.response) {
                    // Server responded with a status code outside 2xx
                    errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
                    console.error('Server responded with error:', {
                        status: error.response.status,
                        data: error.response.data,
                        headers: error.response.headers
                    });
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = "No response received from server. Please check your connection.";
                    console.error('No response received:', error.request);
                } else {
                    // Something happened in setting up the request
                    errorMessage = error.message || errorMessage;
                    console.error('Request setup error:', error.message);
                }
            } else if (error instanceof Error) {
                // Handle other types of errors
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            throw new Error(errorMessage, { cause: error });
        }
    };

    const mutation = useMutation<any, Error, any>({
        mutationFn: createPostApiRequest
    });

    return {
        createPost: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error
    };
};

// src/hooks/useGetAllPosts.ts
interface GetAllPostsParams {
    limit?: number;
    page?: number; // backend expects page, not cursor
}

// Get All Posts Hook
export const useGetAllPosts = (params?: GetAllPostsParams) => {
    const getAllPostsApiRequest = async (): Promise<AllPostsResponse> => {
        try {
            const queryParams = new URLSearchParams();

            if (params?.limit) {
                queryParams.append('limit', params.limit.toString());
            }
            if (params?.page) {
                queryParams.append('page', params.page.toString());
            }

            const url = `/community/get-all-posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await axiosApiClient.get<AllPostsResponse>(url);

            return response.data;
        } catch (error) {
            const message = "Failed to fetch posts";
            toast.error(message);
            throw error;
        }
    };

    const query = useQuery<AllPostsResponse, Error>({
        queryKey: ["community-all-posts", params],
        queryFn: getAllPostsApiRequest,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
    });

    return {
        isLoading: query.isLoading,
        allPosts: query.data?.data ?? [],
        error: query.error,
        pagination: query.data?.pagination,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
    };
};


// ✅ Comment on Post
export const useCommentOnPost = () => {
    const commentOnPostApiRequest = async (data: any): Promise<any> => {
        try {
            const response = await axiosApiClient.post<any>('/community/comment-on-post', data);
            toast.success("Comment posted successfully");
            return response.data;
        } catch (error: unknown) {
            let message = "Failed to post comment";

            if (axios.isAxiosError(error)) {
                // Handle Axios error
                if (error.response?.data) {
                    // Try to get error message from response data
                    const errorData = error.response.data as any;
                    message = errorData.message || errorData.error?.message || message;

                    // Handle validation errors
                    if (error.response.status === 400 && errorData.errors) {
                        message = Object.values(errorData.errors as Record<string, string[]>)
                            .flat()
                            .join('\n');
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    message = "No response from server. Please check your connection.";
                } else {
                    // Something happened in setting up the request
                    message = error.message || message;
                }
            } else if (error instanceof Error) {
                // Handle standard Error
                message = error.message;
            }

            toast.error(message);
            throw new Error(message);
        }
    };

    const mutation = useMutation<any, Error, any>({
        mutationFn: commentOnPostApiRequest,
        // Optional: Add optimistic updates here if needed
        onError: (error) => {
            console.error('Comment submission error:', error);
        }
    });

    return {
        commentOnPost: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset
    };
};


export interface Comment {
    id: string;
    post_id: string;
    parent_comment_id: string | null;
    author_id: string;
    author_name: string;
    author_role: string;
    author_avatar: string;
    content: string;
    images: string[];
    created_at: string; // ISO string
    updated_at: string; // ISO string
    reply_count: string; // backend sends as string
}

export interface GetCommentsResponse {
    success: boolean;
    data: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
    message: string;
}

export const useGetCommentsOnPost = (
    params: { post_id: string; limit?: number; cursor?: string }
) => {
    const fetchComments = async (): Promise<GetCommentsResponse> => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("post_id", params.post_id);

            if (params.limit) queryParams.append("limit", params.limit.toString());
            if (params.cursor) queryParams.append("cursor", params.cursor);

            const response = await axiosApiClient.get<GetCommentsResponse>(
                `/community/get-comments-on-post/${params.post_id}?${queryParams.toString()}`
            );

            return response.data;
        } catch (error) {
            let message = "Failed to fetch comments";

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.message) {
                    message = error.response.data.message;
                }
            }

            toast.error(message);
            throw error;
        }
    };

    const query = useQuery<GetCommentsResponse, Error>({
        queryKey: ["community-comments", params],
        queryFn: fetchComments,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        enabled: Boolean(params.post_id),
    });

    return {
        isLoading: query.isLoading,
        comments: query.data?.data ?? [],
        error: query.error,
        nextCursor: query.data?.nextCursor ?? null,
        hasMore: query.data?.hasMore ?? false,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
    };
};


