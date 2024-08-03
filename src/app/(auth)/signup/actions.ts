'use server'

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpVaues } from "@/lib/validation";
import {hash} from '@node-rs/argon2'
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials:SignUpVaues
):Promise<{error:string}> {
  try {
    const {
      username,
      email,
      password,
    } = signUpSchema.parse(credentials);
    const passwordHash = await hash(password, {
      memoryCost:19456,
      timeCost:2,
      outputLen:32,
      parallelism:1,
    })

    const userId = generateIdFromEntropySize(10);
    const existingUsername = await prisma.user.findFirst({
      where: {
        username:{
          equals:username,
          mode: 'insensitive',
        }
      },
      select:{
        id:true,
      }
    })

    if(existingUsername){
      return {error:'Username already exists'}
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email:{
          equals:email,
          mode: 'insensitive',
        }
      },
      select:{
        id:true,
      }
    })

    if(existingEmail){
      return {error:'Email already exists'}
    }

    await prisma.$transaction(async(tx) => {
      await tx .user.create({
        data:{
          id:userId,
          username,
          displayName:username,
          email,
          passwordHash,
        }
      })
  
      await streamServerClient.upsertUser({
        id:userId,
        username,
        name:username,
      })
    })


    const session = await lucia.createSession(userId,{});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect('/')
  }
  catch (error) {
    if(isRedirectError(error)) throw error;
    
    console.error(error);
    return {error: 'An error occurred, please try again later'};
  }
}