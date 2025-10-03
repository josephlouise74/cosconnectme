// app/components/SocialFeedSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllPosts } from "@/lib/api/communityApi";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import useSelectedPostStore from "@/lib/zustand/selectedPostStore";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreatePostForm from "./components/CreatePostForm";
import PostCard from "./components/PostCard";
import PostPagination from "./components/PostsPagination";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// PostItem type
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

// Transform for PostCard
const transformPostForCard = (post: PostItem) => ({
    id: post.id,
    content: post.content,
    images: post.images,
    created_at: post.created_at,
    heart_count: post.heart_count,
    is_liked: post.is_liked,
    comment_count: post.comment_count,
    author_id: post.author_id,
    author_name: post.author_name,
    author_avatar: post.author_avatar,
    author_role: post.author_role,
    isForSale: post.is_for_sale,
});

const DEFAULT_POSTS_PER_PAGE = 10;

// Schema for search/filter form
const searchSchema = z.object({
    query: z.string().max(100, "Search too long").optional(),
    onlyForSale: z.boolean().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

const SocialFeedSection = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(DEFAULT_POSTS_PER_PAGE);
    const [searchParams, setSearchParams] = useState<SearchForm>({});

    const { isLoading: isAuthLoading } = useSupabaseAuth();
    const setSelectedPost = useSelectedPostStore((state) => state.setSelectedPost);

    const {
        allPosts: fetchedPosts,
        pagination,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useGetAllPosts({
        limit: postsPerPage,
        page: currentPage,
        search: searchParams.query ?? "",
        onlyForSale: searchParams.onlyForSale ?? false,
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    const handleSelectPost = useCallback(
        (post: PostItem) => {
            setSelectedPost(transformPostForCard(post));
        },
        [setSelectedPost]
    );

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setPostsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }, []);

    const handlePostCreated = useCallback(() => {
        setCurrentPage(1);
        refetch();
    }, [refetch]);

    const posts = fetchedPosts ?? [];

    // RHF setup
    const {
        register,
        handleSubmit,

        watch,
        formState: { errors },
    } = useForm<SearchForm>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            query: "",
            onlyForSale: false,
        },
    });




    const onSubmit = (values: SearchForm) => {
        setCurrentPage(1);
        setSearchParams(values);
    };

    // Trigger search when onlyForSale changes
    useEffect(() => {
        const subscription = watch((_, { name }) => {
            if (name === "onlyForSale") {
                handleSubmit(onSubmit)();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, handleSubmit, onSubmit]);


    // Loading
    if (isAuthLoading || (isLoading && currentPage === 1)) {
        return (
            <div className="flex justify-center items-center h-64 h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="text-center">
                    <p className="text-red-500 text-lg font-medium mb-2">
                        Error loading posts
                    </p>
                    <p className="text-gray-600 text-sm">
                        Something went wrong while fetching the posts. Please try again.
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={isRefetching}
                    className="px-6 py-2"
                >
                    {isRefetching ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Retrying...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-6 px-2 sm:px-4 md:px-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                    Recent Posts
                </h2>
                <div className="flex items-center space-x-2">
                    {pagination && (
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {pagination.total} total posts
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefetching}
                        className="self-start sm:self-auto"
                    >
                        {isRefetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Search / Filter Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
                <div className="flex-1 w-full">
                    <Input
                        type="text"
                        placeholder="Search posts..."
                        {...register("query")}
                        className="w-full"
                    />
                    {errors.query && (
                        <p className="text-xs text-red-500 mt-1">{errors.query.message}</p>
                    )}
                </div>
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        {...register("onlyForSale")}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>For Sale Only</span>
                </label>
                <Button type="submit" size="sm" className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    Search
                </Button>
            </form>

            {/* Create Post Form */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <CreatePostForm onPostCreated={handlePostCreated} />
            </div>

            {/* Page loading indicator */}
            {isLoading && currentPage > 1 && (
                <div className="flex justify-center py-8 mb-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading page {currentPage}...</span>
                    </div>
                </div>
            )}

            {/* Posts */}
            <div className="space-y-4 mb-8">
                {posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => handleSelectPost(post)}
                                className="cursor-pointer transition-transform hover:scale-[1.01] duration-200"
                            >
                                <PostCard post={transformPostForCard(post)} refetch={handleRefresh} />
                            </div>
                        ))}
                        {isRefetching && (
                            <div className="flex justify-center py-4">
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Refreshing posts...</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="space-y-3">
                            <p className="text-xl font-medium">No posts found</p>
                            <p className="text-sm text-gray-400">
                                Try adjusting your search or filters.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefetching}
                                className="mt-4"
                            >
                                {isRefetching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                <span className="ml-2">Refresh</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <PostPagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.per_page}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        isLoading={isLoading || isRefetching}
                        className="w-full"
                    />
                </div>
            )}

            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4 text-center text-sm text-gray-500 sm:hidden">
                    Page {pagination.current_page} of {pagination.total_pages}
                </div>
            )}

            {pagination && (
                <div className="mt-4 text-center text-xs text-gray-400">
                    Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(
                        pagination.current_page * pagination.per_page,
                        pagination.total
                    )}{" "}
                    of {pagination.total} posts
                </div>
            )}
        </div>
    );
};

export default SocialFeedSection;
