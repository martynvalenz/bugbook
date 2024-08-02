import { type CommentsPage, type PostData } from "@/lib/types"
import CommentInput from "./CommentInput"
import { useInfiniteQuery } from "@tanstack/react-query"
import kyInstance from "@/lib/ky"
import Comment from "./Comment"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

interface CommentsProps {
  post:PostData
}

const Comments = ({post}:CommentsProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    error
  } = useInfiniteQuery({
    queryKey:['comments',post.id],
    queryFn: ({pageParam }) => kyInstance.get(
      `/api/posts/${post.id}/comments`,
      pageParam ? {searchParams:{cursor:pageParam}} : {}
    ).json<CommentsPage>(),
    initialPageParam:null as string | null,
    getNextPageParam: (firstPage) => firstPage.previousCursor,
    select:(data) => ({
      pages:[...data.pages].reverse(),
      pageParams:[...data.pageParams].reverse()
    })
  })

  const comments = data?.pages.flatMap(page => page.comments) || []
  
  return (
    <div className="space-y-3">
      <CommentInput post={post}/>
      {
        hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetching}
            variant="link"
            className="mx-auto block"
          >
            {isFetching ? 'Loading...' : 'Load previous comments'}
          </Button>
        )
      }
      {
        status == 'pending' && (
          <Loader2 className="mx-auto animate-spin" />
        )
      }
      {
        status == 'success' && !comments.length && (
          <p className="text-muted-foreground text-center">No comments yet</p>
        )
      }
      {
        status == 'error' && (
          <p className="text-red-500 text-center">
            An error occured while fetching comments
          </p>
        )
      }
      <div className="divide-y">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}

export default Comments