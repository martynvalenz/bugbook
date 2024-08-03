import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(){
  try {
    const {user} = await validateRequest()
    if(!user) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    await prisma.notification.updateMany({
      where:{
        recipientId:user.id,
        read:false
      },
      data:{
        read:true
      }
    })

    return new NextResponse(null,{status:204})
    
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}