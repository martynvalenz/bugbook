'use server'

import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import { getPostDataInclude } from "@/lib/types"
import { createPostSchema } from "@/lib/validation"

export const submitPost = async(input:string) => {
  const {user} = await validateRequest()

  if(!user) throw new Error('Unauthorized')

  const {content} = createPostSchema.parse({content:input})

  const newPost = await prisma.post.create({
    data:{
      content,
      userId:user.id
    },
    include:getPostDataInclude(user.id)
  })

  return newPost
}