"use client";

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import useSelectedPostStore from '@/lib/zustand/selectedPostStore';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import CreatePostForm from './components/CreatePostForm';
import PostCard from './components/PostCard';
import useInfiniteScroll from './components/useInfinteScroll';
import { useGetAllPosts } from '@/lib/api/communityApi';
import { PostItem } from '@/lib/types/community/all-posts';

const SocialFeedSection = () => {
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isLoading: isAuthLoading } = useSupabaseAuth();
  const setSelectedPost = useSelectedPostStore((state) => state.setSelectedPost);

  // Fetch posts using the hook
  const { allPosts: fetchedPosts, pagination, isLoading, error, refetch, isRefetching } = useGetAllPosts({
    limit: 10, // Fetch 10 posts at a time
    cursor: cursor || undefined,
  });

  // Update local state when new posts are fetched
  useEffect(() => {
    if (fetchedPosts && fetchedPosts.length > 0) {
      setAllPosts((prev) => {
        // Avoid duplicates by filtering based on post id
        const newPostIds = fetchedPosts.map((post) => post.id);
        const filteredPrev = prev.filter((post) => !newPostIds.includes(post.id));
        return [...filteredPrev, ...fetchedPosts];
      });
      setHasMore(pagination?.hasMore ?? false);
      if (pagination?.nextCursor) {
        setCursor(pagination.nextCursor);
      } else {
        setHasMore(false);
      }
    } else if (!cursor) {
      setAllPosts([]);
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [fetchedPosts, pagination]);

  // Load more posts when user scrolls to the bottom
  const loadMorePosts = useCallback(() => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    refetch(); // Refetch with the updated cursor (handled by the hook via params)
  }, [cursor, hasMore, loadingMore, refetch]);

  const lastElementRef = useInfiniteScroll(loadMorePosts, hasMore, loadingMore);

  const handleSelectPost = (post: PostItem) => {
    setSelectedPost(post);
  };

  if (isAuthLoading || (isLoading && !cursor)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500">Error loading posts. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Retry
        </button>
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
      </div>
      {/* Create Post Form */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <CreatePostForm onPostCreated={() => refetch()} />
      </div>
      {/* Posts List */}
      <div className="space-y-4">
        {allPosts.length > 0 ? (
          allPosts.map((post, index) => (
            <div
              key={post.id}
              ref={index === allPosts.length - 1 ? lastElementRef : null}
              onClick={() => handleSelectPost(post)}
              className="cursor-pointer transition-transform hover:scale-[1.01] duration-200"
            >
              <PostCard post={post} refetch={refetch} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
            No posts yet. Be the first to share something!
          </div>
        )}
        {/* Loading more posts indicator */}
        {(loadingMore || isRefetching) && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        )}
        {/* No more posts message */}
        {!hasMore && allPosts.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg shadow-sm border border-gray-200">
            You've reached the end of the feed.
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeedSection;