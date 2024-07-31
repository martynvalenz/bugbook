import { PostData } from "@/lib/types"
import { useDeletePostMutation } from "./mutations"
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogDescription } from "../ui/dialog"
import LoadingButton from "../LoadingButtons"
import { Button } from "../ui/button"

interface DeletePostDialogProps {
  post:PostData
  open:boolean
  onClose:() => void
}

const DeletePostDialog = ({
  post,
  open,
  onClose
}:DeletePostDialogProps) => {
  const mutation = useDeletePostMutation()

  const handleOpenChange = (open:boolean) => {
    if(!open || !mutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          Delete post?
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant='secondary' disabled={mutation.isPending}>
            Cancel
          </Button>
          <LoadingButton
            onClick={() => mutation.mutate(post.id, {onSuccess:onClose})}
            loading={mutation.isPending}
            variant='destructive'
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePostDialog