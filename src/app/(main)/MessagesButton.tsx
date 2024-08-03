'use client'

import { Button } from "@/components/ui/button"
import kyInstance from "@/lib/ky"
import { type MessageCountInfo } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Props {
  initialState:MessageCountInfo
}

const MessagesButton = ({initialState}:Props) => {
  const {data} = useQuery({
    queryKey:['unread-messages-count'],
    queryFn:() => kyInstance.get('/api/messages/unread-count').json<MessageCountInfo>(),
    initialData:initialState,
    refetchInterval:60 * 1000
  })
  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Messages"
      asChild
    >
      <Link href="/messages">
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
        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  )
}

export default MessagesButton  