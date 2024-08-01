'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import UserAvatar from '@/components/UserAvatar'
import { useSession } from '@/app/(main)/SessionProvider'
import { useSubmitPostMutation } from './mutations'
import LoadingButton from '@/components/LoadingButtons'
import { useMediaUpload, Attachment } from './useMediaUpload';
import './styles.css'
import { ClipboardEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useDropzone } from '@uploadthing/react'

const PostEditor = () => {
  const {user} = useSession()
  const mutation = useSubmitPostMutation()
  const {
    attachments,
    uploadProgress,
    isUploading,
    startUpload,
    removeAttachment,
    reset:resetMediaUploads,
  } = useMediaUpload()

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: startUpload,
  })

  const {
    onClick,
    ...rootProps
  } = getRootProps()
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold:false,
        italic:false,
      }),
      Placeholder.configure({
        placeholder:'What is on your mind?',
      })
    ]
  })

  const input = editor?.getText({
    blockSeparator: '\n',
  }) || ''

  const onSubmit = () => {
    mutation.mutate({
      content:input,
      mediaIds:attachments.map(a => a.mediaId).filter(Boolean) as string[]
    },{
      onSuccess:()=>{
        editor?.commands.clearContent()
        resetMediaUploads()
      }
    })
  }

  const onPaste = (e:ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.items)
    .filter(item => item.kind == 'file')
    .map(item => item.getAsFile()) as File[];

    startUpload(files)
  }

  return (
    <div className='flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm'>
      <div className='flex gap-5'>
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div {...rootProps} className='w-full'>
          <EditorContent 
            editor={editor}
            className={cn('w-full max-h-[20rem] overflow-y-auto bg-slate-200 dark:bg-slate-800 rounded-2xl px-5 py-3', isDragActive && 'outline-dashed border-primary')}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {
        !!attachments.length && (
          <AttachmentPreviews 
            attachments={attachments}
            onRemoveAttachment={removeAttachment}
          />
        )
      }
      <div className='flex justify-end gap-3 items-center'>
        {isUploading && (
          <>
            <span className='text-sm'>{uploadProgress ?? 0}%</span>
            <Loader2 className='size-5 animate-spin text-primary' />
          </>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className='min-w-20'
        >
          Post
        </LoadingButton>
      </div>
    </div>
  )
}

export default PostEditor

interface AddAttachmentsButtonProps {
  onFilesSelected:(files:File[]) => void
  disabled:boolean
}

const AddAttachmentsButton = ({onFilesSelected,disabled}:AddAttachmentsButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        className="hover:text-primary text-primary"
        size="icon"
        variant="ghost"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input 
        type="file" 
        accept='image/*, video/*' 
        multiple
        ref={fileInputRef}
        className='hidden sr-only' 
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if(files.length){
            onFilesSelected(files)
            e.target.value = ''
          }
        }} 
      />
    </>
  )
}

interface AttachmentPreviewsProps {
  attachments:Attachment[]
  onRemoveAttachment:(fileName:string) => void
}

const AttachmentPreviews = ({
  attachments,
  onRemoveAttachment
}:AttachmentPreviewsProps) => {
  return (
    <div className={cn('flex flex-col gap-3', attachments.length > 1 && 'sm:grid sm:grid-cols-2' )}>
      {
        attachments.map((attachment) => (
          <AttachmentPreview 
            key={attachment.file.name}
            attachment={attachment}
            onRemoveClick={() => onRemoveAttachment(attachment.file.name)}
          />
        ))
      }
    </div>
  )
}

interface AttachmentPreviewProps {
  attachment:Attachment
  onRemoveClick:() => void
}

const AttachmentPreview = ({
  attachment:{file,mediaId, isUploading},
  onRemoveClick
}:AttachmentPreviewProps) => {
  const src = URL.createObjectURL(file)

  return (
    <div className={cn('relative mx-auto size-fit', isUploading && 'opacity-50')}>
      {
        file.type.startsWith('image') ? (
          <Image
            src={src}
            alt="Attachment preview"
            width={500}
            height={500}
            className='size-fit max-h-[30rem] rounded-2xl'
          />
        ) : (
          <video 
            controls
            className='size-fit max-h-[30rem] rounded-2xl'
          >
            <source src={src} type={file.type} />
          </video>
        )
      }
      {
        !isUploading && (
          <button 
            className='absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60'
            onClick={onRemoveClick}
          >
            <X size={20} />
          </button>
        )
      }
    </div>
  )
}