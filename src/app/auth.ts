import prisma from '@/lib/prisma'
import {PrismaAdapter} from '@lucia-auth/adapter-prisma'
import { Lucia, Session, User } from 'lucia'
import { cookies } from 'next/headers'
import { cache } from 'react'

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter,{
  sessionCookie: {
    expires:false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    }
  },
  getUserAttributes: (attributes: any) => {
    const userAttributes: DatabaseUserAttibutes = attributes;
    return {
      id: userAttributes.id,
      username: userAttributes.username,
      displayName: userAttributes.displayName,
      avatarUrl: userAttributes.avatarUrl || null,
      googleId: userAttributes.googleId || null,
    };
  }
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttibutes: DatabaseUserAttibutes
  }
}

interface DatabaseUserAttibutes {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  googleId: string | null
}

export const validateRequest = cache(
  async():Promise<
    {user:User; session:Session} | {user:null; session:null}
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
    if(!sessionId){
      return {
        user:null,
        session:null
      }
    }

    const result = await lucia.validateSession(sessionId)

    try {
      if(result.session && result.session.fresh){
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        )
        if(!result.session){
          const sessionCookie = lucia.createBlankSessionCookie()
          cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
          )
        }
      }
    } catch {
      console.error('No session found')
    }

    return result
  }
)