'use client'

import { Button } from "@/components/ui/button"
import kyInstance from "@/lib/ky"
import { type NotificationCountInfo } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Props {
  initialState:NotificationCountInfo
}

const NotificationsButton = ({initialState}:Props) => {
  const {data} = useQuery({
    queryKey:['unread-notifications-count'],
    queryFn:() => kyInstance.get('/api/notifications/unread-count').json<NotificationCountInfo>(),
    initialData:initialState,
    refetchInterval:60 * 1000
  })
  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell className="size-5" />
          {
            !!data.unreadCount && (
              <span className="absolute -top-1 -right-1 -mt-1 -mr-1 px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                {data.unreadCount}
              </span>
            )
          }
        </div>
        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  )
}

export default NotificationsButton  