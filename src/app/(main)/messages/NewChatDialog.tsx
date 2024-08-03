import { Dialog } from "@/components/ui/dialog"
import { DialogContent } from "@radix-ui/react-dialog"

interface Props {
  onOpenChange:(open:boolean)=>void
  onChatCreated:()=>void
}

const NewChatDialog = ({
  onOpenChange,
  onChatCreated
}:Props) => {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent></DialogContent>
    </Dialog>
  )
}

export default NewChatDialog