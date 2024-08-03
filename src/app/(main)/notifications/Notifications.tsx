'use client'

import kyInstance from "@/lib/ky"
import type { NotificationsPage } from "@/lib/types"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import PostsLoadingSkeleton, { PostLoadingSkeleton } from "@/components/posts/PostsLoadingSkeleton"
import InitiniteScrollContainer from "@/components/InitiniteScrollContainer"
import Notification from "./Notification"
import { useEffect } from "react"

const Notifications = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    // isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey:['notifications'],
    queryFn: ({pageParam }) => kyInstance.get(
      '/api/notifications',
      pageParam ? {searchParams:{cursor:pageParam}} : {}
    ).json<NotificationsPage>(),
    initialPageParam:null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const queryClient = useQueryClient()
  const {mutate} = useMutation({
    mutationFn:() => kyInstance.patch('/api/notifications/marked-as-read'),
    onSuccess:() => {
      queryClient.setQueryData(['unread-notifications-count'], {unreadCount:0})
    },
    onError:() => {
      console.error('Failed to mark notifications as read')
    }
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  const notifications = data?.pages.flatMap(page => page.notifications) || []

  if(status == 'pending'){
    return (
      <PostsLoadingSkeleton />
    )
  }

  if(status == 'success' && notifications.length == 0 && !hasNextPage){
    return (
      <div className="text-center text-muted-foreground">No notifications to show</div>
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
        notifications.map(notif => (
          <Notification key={notif.id} notification={notif} />
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

export default Notifications