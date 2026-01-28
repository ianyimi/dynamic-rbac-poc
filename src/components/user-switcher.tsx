import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ShieldAlert } from 'lucide-react'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { useActiveUser } from '~/lib/auth/context'

import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function UserSwitcher() {
  const { activeUserId, setActiveUserId } = useActiveUser()
  const { data: users } = useQuery(convexQuery(api.users.listUsers, {}))

  if (!users) return null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Impersonate User</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 overflow-y-scroll max-h-75">
        {users.map((user) => {
          const isActive = activeUserId === user._id
          return (
            <button
              key={user._id}
              type="button"
              onClick={() =>
                setActiveUserId(isActive ? null : (user._id as Id<'users'>))
              }
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${isActive
                ? 'border-primary bg-green-400/25'
                : 'border-border hover:bg-muted/50'
                }`}
            >
              <span className="font-medium">{user.name}</span>
              <div className="flex gap-1">
                {user.isSuperAdmin && (
                  <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-300">
                    <ShieldAlert className="size-2.5" />
                    Super
                  </Badge>
                )}
                {user.roles.filter(Boolean).length > 0 ? (
                  user.roles.filter(Boolean).map((role) => (
                    <Badge key={role!._id} variant="secondary" className="text-[10px]">
                      {role!.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-[10px] pr-2.5 italic">No roles</span>
                )}
              </div>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
