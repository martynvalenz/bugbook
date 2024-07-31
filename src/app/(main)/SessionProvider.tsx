'use client'

import { Session, User } from "lucia"
import { createContext, useContext, type PropsWithChildren } from "react"

interface SessionContext {
  user:User
  session:Session
}

const SessionContext = createContext<SessionContext | null>(null)

const SessionProvider = ({
  children,
  value
}:PropsWithChildren<{
  value:SessionContext
}>) => {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export default SessionProvider

export const useSession = () => {
  const context = useContext(SessionContext)
  if(!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}