'use server'

import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import streamServerClient from "@/lib/stream"
import { getUserDataSelect } from "@/lib/types"
import { updateUserProfileSchema, type UpdateUserProfileValues } from "@/lib/validation"

export const updateUserProfile = async(values:UpdateUserProfileValues) => {
  const validatedValues = updateUserProfileSchema.parse(values)

  const {user} = await validateRequest()

  if(!user) throw new Error('Unauthorized')

  const updatedUser = await prisma.$transaction(async(tx) => {
    const updatedUser =  await tx.user.update({
      where:{id:user.id},
      data:validatedValues,  
      select:getUserDataSelect(user.id)
    })

    await streamServerClient.partialUpdateUser({
      id:user.id,
      set:{
        name:updatedUser.displayName
      }
    })

    return updatedUser
  })


  return updatedUser
}