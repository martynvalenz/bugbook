'use server'

import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import { getUserDataSelect } from "@/lib/types"
import { updateUserProfileSchema, type UpdateUserProfileValues } from "@/lib/validation"

export const updateUserProfile = async(values:UpdateUserProfileValues) => {
  const validatedValues = updateUserProfileSchema.parse(values)

  const {user} = await validateRequest()

  if(!user) throw new Error('Unauthorized')

  const updatedUser = await prisma.user.update({
    where:{id:user.id},
    data:validatedValues,
    select:getUserDataSelect(user.id)
  })

  return updatedUser
}