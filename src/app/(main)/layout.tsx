import { ReactNode } from "react";
import { validateRequest } from "../auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";

export default async function MainLayout({
 children
}: {
 children: ReactNode;
}) {
  const session = await validateRequest();
  if(!session.user) redirect('/login');

  return (
    <SessionProvider
      value={session}
    >
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-black">
        <Navbar />
        <div className="flex  w-full grow gap-5 max-w-7xl mx-auto p-5">
          <MenuBar
            className="sticky top-[5.25rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80"
          />
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}