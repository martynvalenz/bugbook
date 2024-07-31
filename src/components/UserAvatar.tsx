import Image from "next/image"
import avatarPlaceholder from '@/assets/avatar-placeholder.png'
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  avatarUrl:string | null | undefined
  size?:number
  className?:string
}

const UserAvatar = ({
  avatarUrl,
  size = 48,
  className
}:UserAvatarProps) => {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="user avatar"
      width={size}
      height={size}
      className={cn('aspect-quare h-fit flex-none rounded-full bg-secondary object-cover', className)}
    />
  )
}

export default UserAvatar