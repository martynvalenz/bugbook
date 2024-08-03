'use client'

import Post from "@/components/posts/Post"
import kyInstance from "@/lib/ky"
import type { PostsPage } from "@/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import PostsLoadingSkeleton, { PostLoadingSkeleton } from "@/components/posts/PostsLoadingSkeleton"
import InitiniteScrollContainer from "@/components/InitiniteScrollContainer"

interface SearchResultsProps {
  query:string
}

const SearchResults = ({query}:SearchResultsProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    // isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey:['posts-feed','search',query],
    queryFn: ({pageParam }) => kyInstance.get(
      '/api/search',
      {
        searchParams:{
          q:query,
          ...(pageParam ? {cursor:pageParam} : {})
        }
      }
    ).json<PostsPage>(),
    initialPageParam:null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime:0
  })

  const posts = data?.pages.flatMap(page => page.posts) || []

  if(status == 'pending'){
    return (
      <PostsLoadingSkeleton />
    )
  }

  if(status == 'success' && posts.length == 0 && !hasNextPage){
    return (
      <div className="text-center text-muted-foreground">No posts found</div>
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

export default SearchResults