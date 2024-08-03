import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { notificationsInclude, type NotificationsPage } from "@/lib/types"
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

    const notifications = await prisma.notification.findMany({
      where:{
        recipientId:user.id
      },
      include:notificationsInclude,
      orderBy:{
        createdAt:'desc'
      },
      take:pageSize + 1,
      cursor:cursor ? {id:cursor} : undefined
    })

    const nextCursor = notifications.length > pageSize ? notifications[pageSize].id : null
    const data:NotificationsPage = {
      notifications:notifications.slice(0,pageSize),
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