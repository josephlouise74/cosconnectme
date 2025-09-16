"use client"
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import useSelectedPostStore from '@/lib/zustand/selectedPostStore'
import { Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import CreatePostForm from './components/CreatePostForm'
import PostCard from './components/PostCard'
import useInfiniteScroll from './components/useInfinteScroll'

const SocialFeedSection = () => {
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const { isLoading: isAuthLoading } = useSupabaseAuth();
  const setSelectedPost = useSelectedPostStore(state => state.setSelectedPost);

  const loadMorePosts = useCallback(() => {
    if (!hasMore || loadingMore || !cursor) return
    setLoadingMore(true)
    // TODO: Implement actual data loading logic here
    setLoadingMore(false)
  }, [cursor, hasMore, loadingMore])

  const lastElementRef = useInfiniteScroll(
    loadMorePosts,
    hasMore,
    loadingMore
  )

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 mb-3">
        <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap mb-1 sm:mb-0">Recent Posts</h2>

      </div>

      <CreatePostForm />

      <div className="mt-6 space-y-6">
        {allPosts.length > 0 ? (
          allPosts.map((post, index) => (
            <div
              key={post.id}
              ref={index === allPosts.length - 1 ? lastElementRef : null}
              onClick={() => handleSelectPost(post)}
              className="cursor-pointer"
            >
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialFeedSection