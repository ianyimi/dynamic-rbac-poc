import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

export type Action = 'create' | 'read' | 'update' | 'delete'
export type ResolvedPermissions = Record<string, Action[]>

export function hasPermission(
  permissions: ResolvedPermissions | undefined,
  resource: string,
  action: Action,
): boolean {
  if (!permissions) return false
  const actions = permissions[resource]
  if (!actions) return false
  return actions.includes(action)
}

export function usePermissions(userId: Id<'users'> | null) {
  const { data: permissions, isLoading } = useQuery({
    ...convexQuery(api.permissions.getResolvedPermissions, userId ? { userId } : 'skip'),
    enabled: !!userId,
  })

  return {
    permissions: permissions as ResolvedPermissions | undefined,
    hasPermission: (resource: string, action: Action) =>
      hasPermission(permissions as ResolvedPermissions | undefined, resource, action),
    isLoading,
  }
}
