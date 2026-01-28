import type { ReactNode } from 'react'

import { type Action, type ResolvedPermissions, hasPermission } from '~/lib/auth/permissions'

interface PermissionGateProps {
  permissions: ResolvedPermissions | undefined
  resource: string
  action: Action
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  permissions,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (hasPermission(permissions, resource, action)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}

interface PermissionDisableProps {
  permissions: ResolvedPermissions | undefined
  resource: string
  action: Action
  children: ReactNode
}

export function PermissionDisable({
  permissions,
  resource,
  action,
  children,
}: PermissionDisableProps) {
  const allowed = hasPermission(permissions, resource, action)
  return (
    <div className={allowed ? '' : 'pointer-events-none opacity-50'}>{children}</div>
  )
}
