import { useToast } from "@/components/ui/use-toast";
import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitPost } from "./actions";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useSubmitPostMutation(){
  const {toast} = useToast()
  const {user} = useSession()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn:submitPost,
    onSuccess:async(newPost) => {
      // queryClient.invalidateQueries(['posts-feed','for-you'])
      const queryFilter = {queryKey:['posts-feed'], predicate(query){
        return query.queryKey.includes('for-you') || 
          (query.queryKey.includes('user-posts') && query.queryKey.includes(user?.id))
      }} satisfies QueryFilters
      
      await queryClient.cancelQueries(queryFilter)

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0]
          if(firstPage) {
            return {
              pageParams:oldData?.pageParams,
              pages:[
                {
                  posts:[newPost,...firstPage.posts],
                  nextCursor:firstPage.nextCursor
                },
                ...oldData.pages.slice(1)],
            }
          }
        }
      )

      //* Edge case if the first page is not loaded in cache when posting
      queryClient.invalidateQueries({
        queryKey:queryFilter.queryKey,
        predicate(query){
          return queryFilter.predicate(query) && !query.state.data
        }
      })

      toast({
        description:'Post submitted successfully'
      })
    },
    onError:(error)=>{
      toast({
        variant:'default',
        description:'Failed to submit post, please try again later',
      })
    }
  })

  return mutation
}