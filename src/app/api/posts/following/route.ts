import { validateRequest } from "@/app/auth"
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

    const posts = await prisma.post.findMany({
      where:{
        user:{
          fallowers:{
            some:{
              followerId:user.id
            }
          }
        }
      },
      include:getPostDataInclude(user.id),
      orderBy:{
        createdAt:'desc'
      },
      take:pageSize + 1,
      cursor:cursor ? {
        id:cursor
      } : undefined
    })

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null
    const data:PostsPage = {
      posts:posts.slice(0,pageSize),
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