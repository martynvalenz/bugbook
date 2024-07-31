'use server'

import { lucia } from "@/app/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export async function login(
  credentials: LoginValues
): Promise<{ error: string }> {
  try {
    const {username,password} = loginSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where:{
        username:{
          equals:username,
          mode:'insensitive'
        }
      },
      select:{
        id:true,
        passwordHash:true
      }
    });

    if(!existingUser || !existingUser.passwordHash){
      return {error:'Invalid username or password'}
    }

    const validPassword = await verify(existingUser.passwordHash,password, {
      memoryCost:19456,
      timeCost:2,
      outputLen:32,
      parallelism:1,
    });

    if(!validPassword){
      return {error:'Invalid username or password'}
    }

    const session = await lucia.createSession(existingUser.id ,{});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect('/')
  }
  catch (error) {
    if(isRedirectError(error)) throw error
    console.error(error);
    return { error: "An error occurred, please try again" };
  }
}