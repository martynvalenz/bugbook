'use client'

import { useSession } from "@/app/(main)/SessionProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "./ui/dropdown-menu"
import UserAvatar from "./UserAvatar"
import Link from "next/link"
import { Check, LogOut, Monitor, Moon, Sun, UserIcon } from "lucide-react"
import { logout } from "@/app/(auth)/actions"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"

interface UserButtonProps {
  className?:string
}

const UserButton = ({className}:UserButtonProps) => {
  const {user} = useSession()

  const {
    theme,
    setTheme
  } = useTheme()

  const queryClient = useQueryClient()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn('flex-none rounded-full')}
        >
          <UserAvatar
            className={className}
            avatarUrl={user.avatarUrl}
            size={40}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Logged in as @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem>
            <UserIcon className="size-4 mr-2" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="size-4 mr-2" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="size-4 mr-2" />
                System default
                {theme === 'system' && <Check className="size-4 ms-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="size-4 mr-2" />
                Light
                {theme === 'light' && <Check className="size-4 ms-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="size-4 mr-2" />
                Dark
                {theme === 'dark' && <Check className="size-4 ms-2" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => {
            queryClient.clear()
            logout()
          }}
          className="text-red-500"
        >
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton