import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions, hasPermission } from '~/lib/auth/permissions'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function UserRoleAssignment({
  permissions,
}: {
  permissions: ResolvedPermissions | undefined
}) {
  const { activeUserId } = useActiveUser()
  const { data: users } = useQuery(convexQuery(api.users.listUsers, {}))
  const { data: roles } = useQuery(convexQuery(api.roles.listRoles, {}))
  const { mutate: updateUserRoles } = useMutation({
    mutationFn: useConvexMutation(api.users.updateUserRoles),
  })

  const canUpdate = hasPermission(permissions, 'user_management', 'update')

  if (!users || !roles) return null

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

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>User Role Assignment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 overflow-y-scroll">
        {users.map((user) => (
          <div key={user._id} className="rounded-md border p-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">{user.email}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => {
                const hasRole = user.roleIds.includes(role._id)
                return (
                  <button
                    key={role._id}
                    type="button"
                    onClick={() => toggleRole(user._id, role._id, user.roleIds)}
                    disabled={!canUpdate}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${hasRole
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      } ${!canUpdate ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                  >
                    {role.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
