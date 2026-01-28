import { createContext, use, useState, type ReactNode } from 'react'

import { type Id } from '@convex/_generated/dataModel'

type ActiveUserContextValue = {
  activeUserId: Id<'users'> | null
  setActiveUserId: (id: Id<'users'> | null) => void
}

const ActiveUserContext = createContext<ActiveUserContextValue | null>(null)

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<Id<'users'> | null>(null)

  return (
    <ActiveUserContext value={{ activeUserId, setActiveUserId }}>{children}</ActiveUserContext>
  )
}

export function useActiveUser() {
  const ctx = use(ActiveUserContext)
  if (!ctx) throw new Error('useActiveUser must be used within ActiveUserProvider')
  return ctx
}
