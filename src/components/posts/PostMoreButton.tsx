import { PostData } from "@/lib/types"
import { useState } from "react"
import DeletePostDialog from "./DeletePostDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Button } from "../ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"

interface PostMoreButtonProps {
  post:PostData
  className?:string
}

const PostMoreButton = ({
  post,
  className
}:PostMoreButtonProps) => {
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
      <DeletePostDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        post={post}
      />
    </>
  )
}

export default PostMoreButton