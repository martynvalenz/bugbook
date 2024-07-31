import { useToast } from "../ui/use-toast";
import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./actions";
import { PostsPage } from "@/lib/types";

export const useDeletePostMutation = () => {
  const {toast} = useToast()

  const queryClient = useQueryClient()

  const router = useRouter()
  const pathname = usePathname()

  const mutation = useMutation({
    mutationFn:deletePost,
    onSuccess:async(deletedPost) => {
      const queryFilter:QueryFilters = {queryKey:['posts-feed','for-you']}
      await queryClient.cancelQueries(queryFilter)
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if(!oldData) return
          return {
            pageParams:oldData.pageParams,
            pages:oldData.pages.map((page) => ({
              nextCursor:page.nextCursor,
              posts:page.posts.filter(p => p.id != deletedPost.id)
            }))
          }
        }
      )

      toast({
        description:'Post deleted successfully'
      })

      if(pathname == `/posts/${deletedPost.id}`){
        router.push(`/users/${deletedPost.user.username}`)
      }
    },
    onError(error){
      console.error(error)
      toast({
        variant:'default',
        description:'Failed to delete post, please try again later',
      })
    }
  })

  return mutation
}