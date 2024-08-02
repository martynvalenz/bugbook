import { type CommentData } from "@/lib/types"
import { useDeleteCommentMutation } from "./mutations"
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogDescription } from "../ui/dialog"
import LoadingButton from "../LoadingButtons"
import { Button } from "../ui/button"

interface Props {
  comment:CommentData
  open:boolean
  onClose:() => void
}

const DeleteCommentDialog = ({
  comment,
  open,
  onClose
}:Props) => {
  const mutation = useDeleteCommentMutation()

  const handleOpenChange = (open:boolean) => {
    if(!open || !mutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          Delete comment?
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant='secondary' disabled={mutation.isPending}>
            Cancel
          </Button>
          <LoadingButton
            onClick={() => mutation.mutate(comment.id, {onSuccess:onClose})}
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

export default DeleteCommentDialog