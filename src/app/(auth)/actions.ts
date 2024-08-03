'use server'

import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/auth"
import { redirect } from "next/navigation";

export async function logout() {
  const {session} = await validateRequest();

  if(!session){
    throw new Error('Unauthorized')
  }
  await lucia.invalidateUserSessions(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect('/login')
}