'use client'

import Post from "@/components/posts/Post"
import kyInstance from "@/lib/ky"
import type { PostData, PostsPage } from "@/lib/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

const ForYouFeed = () => {
  const query = useQuery<PostData[]>({
    queryKey:['posts-feed','for-you'],
    queryFn: async() => kyInstance.get('/api/posts/for-you').json<PostData[]>()
  })

  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetching,
  //   isFetchingNextPage,
  //   status
  // } = useInfiniteQuery({
  //   queryKey:['posts-feed','for-you'],
  //   queryFn: ({pageParam }) => kyInstance.get(
  //     '/api/posts/for-you',
  //     pageParam ? {searchParams:{cursor:pageParam}} : {}
  //   ).json<PostsPage>(),
  //   initialPageParam:null as string | null,
  //   getNextPageParam: (lastPage) => lastPage.nextCursor
  // })

  if(query.status == 'pending'){
    return (
      <Loader2 className="mx-auto animate-spin" />
    )
  }

  if(query.status == 'error'){
    return (
      <div className="text-center text-destructive">Error: {query.error.message}</div>
    )
  }

  return (
    <div className="space-y-5">
      {
        query.data.map(post => (
          <Post key={post.id} post={post} />
        ))
      }
    </div>
  )
}

export default ForYouFeed