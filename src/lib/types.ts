import { Prisma } from "@prisma/client";

export const getUserDataSelect = (loggedInUserId:string) => {
  return {
    id:true,
    username:true,
    displayName:true,
    avatarUrl:true,
    bio:true,
    createdAt:true,
    fallowers:{
      where:{
        followerId:loggedInUserId
      },
      select:{
        followerId:true
      }
    },
    _count:{
      select:{
        fallowers:true,
        posts:true
      }
    }
  } satisfies Prisma.UserSelect
}

export type UserData = Prisma.UserGetPayload<{
  select:ReturnType<typeof getUserDataSelect>
}>

// export const userDataSelect = {
//   id:true,
//   username:true,
//   displayName:true,
//   avatarUrl:true
// } satisfies Prisma.UserSelect

export const getPostDataInclude = (loggedInUserId:string) => {
  return {
    user:{
      select:getUserDataSelect(loggedInUserId)
    }
  } satisfies Prisma.PostInclude
}

// export const postDataInclude = {
//   user:{
//     select:userDataSelect
//   }
// } satisfies Prisma.PostInclude

export type PostData = Prisma.PostGetPayload<{
  include:ReturnType<typeof getPostDataInclude>
}>

export interface PostsPage {
  posts:PostData[]
  nextCursor:string | null
}

export interface FollowerInfo {
  followers:number,
  isFollowedByUser:boolean
}