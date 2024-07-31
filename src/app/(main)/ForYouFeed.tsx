'use client'

import Post from "@/components/posts/Post"
import kyInstance from "@/lib/ky"
import type { PostsPage } from "@/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import InitiniteScrollContainer from '../../components/InitiniteScrollContainer';
import PostsLoadingSkeleton, { PostLoadingSkeleton } from "@/components/posts/PostsLoadingSkeleton"

const ForYouFeed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    // isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey:['posts-feed','for-you'],
    queryFn: ({pageParam }) => kyInstance.get(
      '/api/posts/for-you',
      pageParam ? {searchParams:{cursor:pageParam}} : {}
    ).json<PostsPage>(),
    initialPageParam:null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const posts = data?.pages.flatMap(page => page.posts) || []

  if(status == 'pending'){
    return (
      <PostsLoadingSkeleton />
    )
  }

  if(status == 'success' && posts.length == 0 && !hasNextPage){
    return (
      <div className="text-center text-muted-foreground">No posts to show</div>
    )
  }

  if(status == 'error'){
    return (
      <div className="text-center text-destructive">Error: {error.message}</div>
    )
  }

  return (
    <InitiniteScrollContainer className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {
        posts.map(post => (
          <Post key={post.id} post={post} />
        ))
      }
      {
        isFetching && (
          <PostLoadingSkeleton />
        )
      }
    </InitiniteScrollContainer>
  )
}

export default ForYouFeed