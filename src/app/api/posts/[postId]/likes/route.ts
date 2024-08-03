import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { type LikeInfo } from "@/lib/types"
import { NextResponse } from "next/server"

export async function GET(req:Request, 
  {params:{postId}}:{params:{postId:string}}
) {
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({error:'Unauthorized'}, {status:401})

    const post = await prisma.post.findUnique({
      where:{id:postId},
      select:{
        likes:{
          where:{
            userId:loggedInUser.id
          },
          select:{
            userId:true
          }
        },
        _count:{
          select:{
            likes:true
          }
        }
      }
    })

    if(!post){
      return NextResponse.json({error:'Post not found'}, {status:404})
    }

    const data:LikeInfo = {
      likes:post._count.likes,
      isLikedByUser:!!post.likes.length
    }

    return NextResponse.json(data)
  }
  catch (error) {
    console.error(error)
    return NextResponse.json({error:'Failed to fetch post'}, {status:500})
  }
}

export async function POST(
  req:Request,
  {params:{postId}}:{params:{postId:string}}){
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    const post = await prisma.post.findUnique({
      where:{id:postId},
      select:{
        userId:true
      }
    })

    if(!post) return NextResponse.json({
      error:'Post not found'
    },{status:404})

    await prisma.$transaction([
      prisma.like.upsert({
        where:{
          userId_postId:{
            postId,
            userId:loggedInUser.id
          }
        },
        create:{
          postId,
          userId:loggedInUser.id
        },
        update:{}
      }),
      ...(loggedInUser.id !== post.userId 
        ? [
          prisma.notification.create({
            data:{
              type:'LIKE',
              recipientId:post.userId,
              postId,
              issuerId:loggedInUser.id
            }
          })
        ] 
        : [] 
      )
    ])
    
    return NextResponse.json({message:'Success'})
  }
  catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}

export async function DELETE(
  req:Request,
  {params:{postId}}:{params:{postId:string}}
) {
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    const post = await prisma.post.findUnique({
      where:{id:postId},
      select:{
        userId:true
      }
    })

    if(!post) return NextResponse.json({
      error:'Post not found'
    },{status:404})

    await prisma.$transaction([
      prisma.like.deleteMany({
        where:{
          postId,
          userId:loggedInUser.id
        }
      }),
      prisma.notification.deleteMany({
        where:{
          issuerId:loggedInUser.id,
          recipientId:post.userId,
          postId,
          type:'LIKE'
        }
      })
    ])

    return new Response()
  }
  catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}