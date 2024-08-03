import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react"
import { useSession } from "../SessionProvider"
import { useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import { UserResponse } from "stream-chat"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, Loader2, SearchIcon, X } from "lucide-react"
import UserAvatar from "@/components/UserAvatar"
import LoadingButton from "@/components/LoadingButtons"

interface Props {
  onOpenChange:(open:boolean)=>void
  onChatCreated:()=>void
}

const NewChatDialog = ({
  onOpenChange,
  onChatCreated
}:Props) => {
  const {
    client,
    setActiveChannel
  } = useChatContext()
  const {toast} = useToast()
  const{user:loggedInUser} = useSession()
  const [searchInput, setSearchInput] = useState('')

  const searchInputDebounced = useDebounce(searchInput, 600)
  const [selectedUsers, setSelectedUsers] = useState<UserResponse<DefaultStreamChatGenerics>[]>([])

  const {data,isFetching,isError,isSuccess} = useQuery({
    queryKey:['stream-users',searchInputDebounced],
    queryFn: async() => client.queryUsers({
      id: { $ne: loggedInUser.id },
      role: { $ne: 'admin' },
      ...(searchInputDebounced
        ? { 
            $or:[
              {name:{ $autocomplete: searchInputDebounced }},
              {username:{ $autocomplete: searchInputDebounced }}
            ]
          }
        : {}
      ),
      },
      {name:1,username:1},
      { limit: 15 }
    )
  })

  const mutation = useMutation({
    mutationFn: async() => {
      const channel = client.channel('messaging', {
        members: [loggedInUser.id, ...selectedUsers.map(u => u.id)],
        name: selectedUsers.length > 1 
          ? loggedInUser.displayName + ", " + selectedUsers.map(u => u.name).join(", ") 
          : undefined
      })
      await channel.create()
      return channel
    },
    onSuccess: (channel) => {
      setActiveChannel(channel)
      onChatCreated()
    },
    onError: (error) => {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error.message
      })
    }
  })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input 
              type="text"
              className="w-full h-12 pe-4 ps-14 text-lg focus:outline-none bg-transparent"
              placeholder="Search for users..."
              value={searchInput}
              onChange={(e)=>setSearchInput(e.target.value)}
            />
          </div>
          <hr/>
          {
            selectedUsers.length > 0 && (
              <div className="flex my-3 flex-wrap gap-2 p-2">
                {
                  selectedUsers.map(user => (
                    <SelectedUserTag 
                      key={user.id}
                      user={user}
                      onRemove={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                    />
                  ))
                }
              </div>
            )
          }
          <div className="h-96 overflow-y-auto">
            {
              isSuccess && (
                data.users.map(user => (
                  <UserResult 
                    key={user.id}
                    user={user}
                    selected={selectedUsers.some(u => u.id === user.id)}
                    onClick={() => {
                      setSelectedUsers(prev =>
                        prev.some(u => u.id === user.id)
                        ? prev.filter(u => u.id !== user.id)
                        : [...prev,user]
                      )
                    }}
                  />
                ))
              )
            }
            {
              isSuccess && !data.users.length && (
                <p className="text-center text-muted-foreground">No users found, try a different name</p>
              )
            }
            {
              isFetching && (
                <Loader2 className="mx-auto my-3 animate-spin"/>
              )
            }
            {
              isError && (
                <p className="text-center text-red-500">Failed to load users</p>
              )
            }
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <LoadingButton 
            disabled={selectedUsers.length < 1}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Start Chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewChatDialog

interface UserResultProps {
  user:UserResponse<DefaultStreamChatGenerics>
  selected:boolean
  onClick:() => void
}

const UserResult = ({
  user,
  selected,
  onClick
}:UserResultProps) => {
  return (
    <button className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50" onClick={onClick}>
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={user.image}/>
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      {selected && <Check className="size-5 text-primary flex-none"/>}
    </button>
  )
}

interface SelectedUserTagProps {
  user:UserResponse<DefaultStreamChatGenerics>
  onRemove:() => void
}

const SelectedUserTag = ({
  user,
  onRemove
}:SelectedUserTagProps) => {
  return (
    <button 
      className="flex items-center gap-2 p-1 bg-muted/50 text-primary/90 rounded-full border"
      onClick={onRemove}
    >
      <UserAvatar avatarUrl={user.image} size={24}/>
      <p className="font-bold">{user.name}</p>
      <X className="size-5 mx-2 text-muted-foreground"/>
    </button>
  )
}