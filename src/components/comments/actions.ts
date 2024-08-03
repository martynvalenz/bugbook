'use server'

import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { getCommentDataInclude, type PostData } from "@/lib/types"
import { createCommentSchema } from "@/lib/validation"

export const submitComment = async ({post,content}:{post:PostData,content:string}) => {
  try {
    const {user} = await validateRequest()
  
    if(!user) throw new Error('Unauthorized')
  
    const {content:contentValidated} = createCommentSchema.parse({content})

    const [newComment] = await prisma.$transaction([
      prisma.comment.create({
        data:{
          content:contentValidated.trim(),
          postId:post.id,
          userId:user.id,
        },
        include:getCommentDataInclude(user.id)
      }),
      ...(post.userId !== user.id 
        ? [
          prisma.notification.create({
            data:{
              issuerId:user.id,
              type:'COMMENT',
              postId:post.id,
              recipientId:post.userId
            }
          })
        ]
        : []
      )
    ])
  
    return newComment
    
  } catch (error) {
    console.error(error)
    throw new Error('Internal server error')
  }
}

export const deleteComment = async (id:string) => {
  const {user} = await validateRequest()
  
  if(!user) throw new Error('Unauthorized')

  const comment = await prisma.comment.findUnique({
    where:{
      id
    },
    select:{
      userId:true
    }
  })

  if(!comment) throw new Error('Comment not found')

  if(comment.userId !== user.id) throw new Error('Unauthorized')

  const deletedComment = await prisma.comment.delete({
    where:{
      id
    },
    include:getCommentDataInclude(user.id)
  })

  return deletedComment
}