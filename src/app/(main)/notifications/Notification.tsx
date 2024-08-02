import UserAvatar from "@/components/UserAvatar"
import { type NotificationData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { NotificationType } from "@prisma/client"
import { Heart, MessageCircle, User2 } from "lucide-react"
import Link from "next/link"

interface Props {
  notification:NotificationData
}

const Notification = ({notification}:Props) => {
  const notificationTypeMap:Record<NotificationType,{
    message:string,
    icon:JSX.Element,
    href:string
  }> = {
    FOLLOW:{
      message:`started following you`,
      icon:<User2 className="size-7 text-primary" />,
      href:`/users/${notification.issuer?.username}`
    },
    LIKE:{
      message:`liked your post`,
      icon:<Heart className="size-7 text-red-500 fill-red-400" />,
      href:`/posts/${notification.postId}`
    },
    COMMENT:{
      message:`commented on your post`,
      icon:<MessageCircle className="size-7 text-primary" />,
      href:`/posts/${notification.postId}`
    },
  }

  const {message,icon,href} = notificationTypeMap[notification.type]

  return (
    <Link href={href} className="block">
      <article className={cn('flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70',
        notification.read && 'bg-primary/70'
      )}>
        <div className="my-1">
          {icon}
        </div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer?.avatarUrl} size={36} />
          <div>
            <span className="font-bold">{notification.issuer?.displayName}</span>{" "}
            <span>{message}</span>
          </div>
          {
            notification.post && (
              <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
                {notification.post.content}
              </div>
            )
          }
        </div>
      </article>
    </Link>
  )
}

export default Notification