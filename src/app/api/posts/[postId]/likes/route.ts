import { validateRequest } from "@/app/auth"
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

    await prisma.like.upsert({
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
    })
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

    await prisma.like.deleteMany({
      where:{
        postId,
        userId:loggedInUser.id
      }
    })

    return new Response()
  }
  catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}