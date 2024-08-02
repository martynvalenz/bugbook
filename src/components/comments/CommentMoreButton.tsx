import { type CommentData } from "@/lib/types"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Button } from "../ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"
import DeleteCommentDialog from "./DeleteCommentDialog"

interface Props {
  comment:CommentData
  className?:string
}

const CommentMoreButton = ({
  comment,
  className
}:Props) => {
  const [showDeleteDialog,setShowDeleteDialog] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
          >
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-5"/>
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        comment={comment}
      />
    </>
  )
}

export default CommentMoreButton