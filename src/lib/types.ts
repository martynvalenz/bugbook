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
    },
    attachments:true,
    likes:{
      where:{
        userId:loggedInUserId
      },
      select:{
        userId:true
      }
    },
    _count:{
      select:{
        likes:true,
        comments:true
      }
    },
    bookmarks:{
      where:{
        userId:loggedInUserId
      },
      select:{
        userId:true
      }
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

export interface LikeInfo {
  likes:number,
  isLikedByUser:boolean
}

export interface BookmarkInfo {
  isBookmarkedByUser:boolean
}

export function getCommentDataInclude(loggedInUserId:string) {
  return {
    user:{
      select:getUserDataSelect(loggedInUserId)
    }
  } satisfies Prisma.CommentInclude
}

export type CommentData = Prisma.CommentGetPayload<{
  include:ReturnType<typeof getCommentDataInclude>
}>

export interface CommentsPage {
  comments:CommentData[]
  previousCursor:string | null
}

export const notificationsInclude = {
  issuer:{
    select:{
      username:true,
      displayName:true,
      avatarUrl:true
    }
  },
  post:{
    select:{
      content:true
    }
  }
} satisfies Prisma.NotificationInclude

export type NotificationData = Prisma.NotificationGetPayload<{
  include:typeof notificationsInclude
}>

export interface NotificationsPage {
  notifications:NotificationData[]
  nextCursor:string | null
}

export interface NotificationCountInfo {
  unreadCount:number
}