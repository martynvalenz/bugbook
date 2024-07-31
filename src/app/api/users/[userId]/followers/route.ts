import { validateRequest } from '@/app/auth';
import prisma from '@/lib/prisma';
import { FollowerInfo } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req:NextRequest,
  {params:{userId}}:{params:{userId:string}}
) {
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    const user = await prisma.user.findUnique({
      where:{
        id:userId
      },
      select:{
        fallowers:{
          where:{
            followerId:loggedInUser.id
          },
          select:{
            followerId:true
          }
        },
        _count:{
          select:{
            fallowers:true
          }
        }
      }
    })

    if(!user) return NextResponse.json({
      error:'User not found'
    },{status:404})

    const data:FollowerInfo = {
      followers:user._count.fallowers,
      isFollowedByUser:!!user.fallowers.length
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      error:'Internal server error'
    },{status:500})
  }
}

export async function POST(
  req:Request,
  {params:{userId}}:{params:{userId:string}}){
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    await prisma.follow.upsert({
      where:{
        followerId_followingId:{
          followerId:loggedInUser.id,
          followingId:userId
        }
      },
      create:{
        followerId:loggedInUser.id,
        followingId:userId
      },
      update:{}
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

export async function DELETE(
  req:Request,
  {params:{userId}}:{params:{userId:string}}
) {
  try {
    const {user:loggedInUser} = await validateRequest()
    if(!loggedInUser) return NextResponse.json({
      error:'Unauthorized'
    },{status:401})

    await prisma.follow.deleteMany({
      where:{
        followerId:loggedInUser.id,
        followingId:userId
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