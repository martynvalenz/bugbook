import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UTApi } from "uploadthing/server"

export async function GET(req:Request){
  try {
    const authHeader = req.headers.get('Authorization')
    if(authHeader !== `Bearer ${process.env.CRON_SECRET}`){
      return NextResponse.json({
        error:'Unauthorized'
      },{status:401})
    }

    const unusedFiles = await prisma.media.findMany({
      where:{
        postId:null,
        ...(process.env.NODE_ENV === 'production' ? {createdAt:{lte:new Date(Date.now() - (1000 * 60 * 60 * 24))}} : {})
      },
      select:{
        id:true,
        url:true
      }
    })

    new UTApi().deleteFiles(
      unusedFiles.map(({url}) => url.split(
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      )[1])
    )

    await prisma.media.deleteMany({
      where:{
        id:{
          in:unusedFiles.map(({id}) => id)
        }
      }
    })

    return NextResponse.json({
      success:true
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}