'use client'

import { useFollowerInfo } from "@/hooks/useFollowerInfo"
import { type FollowerInfo } from "@/lib/types"
import { useToast } from "./ui/use-toast"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "./ui/button"
import kyInstance from "@/lib/ky"

interface FollowButtonProps {
  userId:string
  initialState:FollowerInfo
}

const FollowButton = ({
  userId,
  initialState
}:FollowButtonProps) => {
  const {toast} = useToast()
  const queryClient = useQueryClient()
  const {data} = useFollowerInfo(userId, initialState)
  const queryKey:QueryKey = ['follower-info',userId]

  const {mutate} = useMutation({
    mutationFn:() => data.isFollowedByUser 
      ? kyInstance.delete(`/api/users/${userId}/followers`)
      : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate:async() => {
      await queryClient.cancelQueries({queryKey})
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey)
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:(previousState?.followers || 0) + (data.isFollowedByUser ? -1 : 1),
        isFollowedByUser:(!previousState?.isFollowedByUser)
      }))

      return {previousState}
    },
    onError(error, variables, context){
      queryClient.setQueryData(queryKey, context?.previousState)
      toast({
        variant:'destructive',
        description:'Failed to follow user, please try again later',
      })
    }
  })

  return (
    <Button
      variant={data.isFollowedByUser ? 'secondary' : 'default'}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

export default FollowButton