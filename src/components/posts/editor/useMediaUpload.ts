import { useToast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/uploadthing"
import { useState } from "react"

export interface Attachment {
  file:File
  mediaId?:string
  isUploading:boolean
}

export const useMediaUpload = () => {
  const {toast} = useToast()

  const [attachments,setAttachments] = useState<Attachment[]>([])

  const [uploadProgress,setUploadProgress] = useState<number>()

  const {startUpload,isUploading} = useUploadThing('attachment',{
    onBeforeUploadBegin(files){
      const renamedFiles = files.map(file => {
        const extension = file.name.split('.').pop()
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {type:file.type}
        )
      });

      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map(file => ({
          file,
          isUploading:true
        }))
      ]);

      return renamedFiles
    },
    onUploadProgress:setUploadProgress,
    onClientUploadComplete(res){
      setAttachments(prev => prev.map(a => {
        const uploadResult = res.find(r => r.name === a.file.name)
        if(!uploadResult) return a

        return {
          ...a,
          mediaId:uploadResult.serverData.mediaId,
          isUploading:false
        }
      }))
    },
    onUploadError(err){
      setAttachments(prev => prev.filter(a => !a.isUploading))
      toast({
        variant:'destructive',
        title:'Upload failed',
        description:err.message,
      })
    }
  })

  const handleStartUpload = (files:File[]) => {
    if(isUploading){
      toast({
        title:'Upload in progress',
        description:'Please wait for the current upload to finish',
        variant:'destructive'
      })
      return
    }

    if(attachments.length + files.length > 5){
      toast({
        title:'Too many attachments',
        description:'You can only upload up to 5 attachments at a time',
        variant:'destructive'
      })
      return
    }

    startUpload(files)
  }

  const removeAttachment = (fileName:string) => {
    setAttachments(prev => prev.filter(a => a.file.name !== fileName))
  }

  const reset = () => {
    setAttachments([])
    setUploadProgress(undefined)
  }

  return {
    attachments,
    uploadProgress,
    isUploading,
    startUpload:handleStartUpload,
    removeAttachment,
    reset
  }
}