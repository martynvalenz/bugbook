import { type PostData } from "@/lib/types"
import { FormEvent, useState } from "react"
import { useSubmitCommentMutation } from "./mutations"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2, SendHorizontal } from "lucide-react"

interface CommentInputProps {
  post:PostData
}

const CommentInput = ({post}:CommentInputProps) => {
  const [input, setInput] = useState('')

  const mutation = useSubmitCommentMutation(post.id)

  const onSubmit = (e:FormEvent) => {
    e.preventDefault()

    if(!input.trim()) return

    mutation.mutate(
      {post, content:input.trim()},
      {
        onSuccess:() => {
          setInput('')
        }
      }
    )
  }

  return (
    <form onSubmit={onSubmit} className='flex w-full items-center gap-2'>
      <Input
        type='text'
        placeholder='Write a comment...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
        // className='flex-1 p-3 bg-card rounded-lg focus:outline-none'
      />
      <Button
        type='submit'
        variant="ghost"
        size="icon"
        disabled={mutation.isPending || !input.trim()}
      >
        {
          !mutation.isPending ? (
            <SendHorizontal />
          ) : (
            <Loader2 className="animate-spin" />
          )
        }
      </Button>
    </form>
  )
}

export default CommentInput