import { type BookmarkInfo } from "@/lib/types"
import { type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "../ui/use-toast"
import kyInstance from "@/lib/ky"
import { Bookmark, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  postId:string
  initialState:BookmarkInfo
}

const BookmarkButton = ({
  postId,
  initialState
}:BookmarkButtonProps) => {
  const {toast} = useToast()
  const queryClient = useQueryClient()
  const queryKey:QueryKey = ['bookmark-info',postId]

  const {data} = useQuery({
    queryKey,
    queryFn:() => kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData:initialState,
    staleTime:Infinity
  })

  const {mutate} = useMutation({
    mutationFn:() => {
      return data.isBookmarkedByUser 
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`)
    },
    onMutate:async() => {
      toast({
        description:`Post ${data.isBookmarkedByUser ? 'unbookmarked' : 'bookmarked'}`,
      })
      await queryClient.cancelQueries({queryKey})
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey)
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser:(!previousState?.isBookmarkedByUser)
      }));

      return {previousState}
    },
    onError(error, variables, context){
      queryClient.setQueryData(queryKey, context?.previousState)
      toast({
        variant:'destructive',
        description:'Failed to bookmark post, please try again later',
      })
    }
  })
  
  return (
    <button
      className="flex items-center gap-2"
      onClick={() => mutate()}
    >
      <Bookmark className={cn('size-5', data.isBookmarkedByUser && 'fill-emerald-500 text-emerald-500')} />
    </button>
  )
}

export default BookmarkButton