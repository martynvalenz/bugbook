'use client'

import { Button } from "@/components/ui/button"
import { type UserData } from "@/lib/types"
import { useState } from "react"
import EditProfileDialog from "./EditProfileDialog"

interface EditProfileButtonProps {
  user:UserData
}

const EditProfileButton = ({user}:EditProfileButtonProps) => {
  const [showDialog,setShowDialog] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setShowDialog(true)}
      >
        Edit profile
      </Button>
      <EditProfileDialog 
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  )
}

export default EditProfileButton