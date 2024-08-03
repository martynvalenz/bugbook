import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { type BookmarkInfo } from "@/lib/types"
import { NextResponse } from "next/server"

export async function GET(req:Request, 
  {params:{postId}}:{params:{postId:string}}
) {
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({error:'Unauthorized'}, {status:401})

    const bookmark = await prisma.bookmark.findUnique({
      where:{
        userId_postId:{
          postId,
          userId:loggedInUser.id
        }
      }
    })

    const data:BookmarkInfo = {
      isBookmarkedByUser:!!bookmark
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

    await prisma.bookmark.upsert({
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

    await prisma.bookmark.deleteMany({
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