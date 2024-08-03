import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { getPostDataInclude, type PostsPage } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req:NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get('cursor') || undefined
    // await new Promise(r => setTimeout(r, 4000))
    const pageSize = 5

    const {user} = await validateRequest()
    if(!user) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    const bookmarks = await prisma.bookmark.findMany({
      where:{
        userId:user.id
      },
      include:{
        post:{
          include:getPostDataInclude(user.id)
        }
      },
      orderBy:{
        createdAt:'desc'
      },
      take:pageSize + 1,
      cursor:cursor ? {
        id:cursor
      } : undefined
    })

    const nextCursor = bookmarks.length > pageSize ? bookmarks[pageSize].id : null
    const data:PostsPage = {
      posts:bookmarks.slice(0,pageSize).map(bookmark => bookmark.post),
      nextCursor
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}