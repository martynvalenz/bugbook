'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { type UserData } from "@/lib/types"
import { updateUserProfileSchema, UpdateUserProfileValues } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useUpdateProfileMutation } from "./mutations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import LoadingButton from "@/components/LoadingButtons"
import Image, { type StaticImageData } from "next/image"
import { useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import avatarPlaceholer from '@/assets/avatar-placeholder.png'
import { Camera } from "lucide-react"
import CropImageDialog from "@/components/CropImageDialog"
import Resizer from 'react-image-file-resizer'

interface EditProfileDialogProps {
  user:UserData
  open:boolean
  onOpenChange:(open:boolean) => void
}

const EditProfileDialog = ({
  user,
  open,
  onOpenChange
}:EditProfileDialogProps) => {
  const form = useForm<UpdateUserProfileValues>({
    resolver:zodResolver(updateUserProfileSchema),
    defaultValues:{
      displayName:user.displayName,
      bio:user.bio || ''
    }
  })

  const mutation = useUpdateProfileMutation()

  const onSubmit = (values:UpdateUserProfileValues) => {
    const newAvatarFile = croppedAvatar ? new File([croppedAvatar],`avatar_${user.id}.webp`) : undefined

    mutation.mutate({
      values,
      avatar:newAvatarFile
    },{
      onSuccess:() => {
        setCroppedAvatar(null)
        onOpenChange(false)
      }
    })
  }

  const[croppedAvatar,setCroppedAvatar] = useState<Blob | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>Edit Profile</DialogHeader>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <AvatarInput
            src={croppedAvatar ? URL.createObjectURL(croppedAvatar) : user.avatarUrl || avatarPlaceholer}
            onImageCropped={setCroppedAvatar}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="displayName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            <FormField
              control={form.control}
              name="bio"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Tell us a little bit about yourself" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfileDialog

interface AvatarInputProps {
  src:string | StaticImageData
  onImageCropped:(blob:Blob | null) => void
}

const AvatarInput = ({src,onImageCropped}:AvatarInputProps) => {
  const [imageToCrop,setImageToCrop] = useState<File>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onImageSelected = (image:File|undefined) => {
    if(!image) return
    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      'WEBP',
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      'file'
    )
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={e => onImageSelected(e.target.files?.[0])}
        className="hidden sr-only"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && <CropImageDialog
        src={URL.createObjectURL(imageToCrop)}
        cropAspectRatio={1}
        onCropped={onImageCropped}
        onClose={() => {
          setImageToCrop(undefined)
          if(fileInputRef.current) fileInputRef.current.value = ''
        }}
      />}
    </>
  )
}