import { ReactNode } from "react";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
 children
}: {
 children: ReactNode;
}) {
  const {user} = await validateRequest();
  if(user) redirect('/');

  return (
    <>
      {children}
    </>
  );
}