import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { Lock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions, hasPermission } from '~/lib/auth/permissions'

import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function UserManagementCard({
  permissions,
}: {
  permissions: ResolvedPermissions | undefined
}) {
  const { activeUserId } = useActiveUser()
  const { data: users } = useQuery(convexQuery(api.users.listUsers, {}))
  const { data: roles } = useQuery(convexQuery(api.roles.listRoles, {}))
  const { data: constraints } = useQuery({
    ...convexQuery(
      api.users.getRoleAssignmentConstraints,
      activeUserId ? { callerUserId: activeUserId } : 'skip',
    ),
    enabled: !!activeUserId,
  })
  const { mutate: updateUserRoles } = useMutation({
    mutationFn: useConvexMutation(api.users.updateUserRoles),
  })

  const canRead = hasPermission(permissions, 'user_management', 'read')

  const toggleRole = (userId: Id<'users'>, roleId: Id<'roles'>, currentRoleIds: Id<'roles'>[]) => {
    if (!activeUserId) return
    const newRoleIds = currentRoleIds.includes(roleId)
      ? currentRoleIds.filter((id) => id !== roleId)
      : [...currentRoleIds, roleId]

    updateUserRoles(
      { callerUserId: activeUserId, userId, roleIds: newRoleIds },
      {
        onSuccess: () => toast.success('Roles updated'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const isRoleLocked = (userId: string, roleId: string): boolean => {
    if (!constraints?.canUpdate) return true
    return constraints.lockedRoles[userId]?.includes(roleId) ?? false
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-scroll max-h-125">
        {!canRead ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Lock className="text-muted-foreground size-8" />
            <span className="text-muted-foreground text-sm">No access</span>
          </div>
        ) : !users || !roles ? (
          <div className="text-muted-foreground py-4 text-center text-sm">Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div key={user._id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  {user.isSuperAdmin && (
                    <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-300">
                      <ShieldAlert className="size-2.5" />
                      Super
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-xs">{user.email}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((role) => {
                    const hasRole = user.roleIds.includes(role._id)
                    const locked = isRoleLocked(user._id, role._id)

                    return (
                      <button
                        key={role._id}
                        type="button"
                        onClick={() => toggleRole(user._id, role._id, user.roleIds)}
                        disabled={locked}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          hasRole
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        } ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {role.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
