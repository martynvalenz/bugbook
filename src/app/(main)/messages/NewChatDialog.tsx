import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useChatContext } from "stream-chat-react"
import { useSession } from "../SessionProvider"
import { useState } from "react"

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
  

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default NewChatDialog