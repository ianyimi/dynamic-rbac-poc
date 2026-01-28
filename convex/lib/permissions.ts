import { type GenericQueryCtx } from 'convex/server'

import {
  TABLE_PERMISSIONS,
  TABLE_RESOURCES,
  TABLE_USERS,
} from '~/db/constants'

import { type DataModel, type Id } from '../_generated/dataModel'

type Ctx = GenericQueryCtx<DataModel>

export async function checkPermission(
  ctx: Ctx,
  userId: Id<typeof TABLE_USERS>,
  resourceName: string,
  action: string,
): Promise<boolean> {
  const user = await ctx.db.get(userId)
  if (!user) return false

  if (!user.roleIds || user.roleIds.length === 0) return false

  // Check if any role is isSystem (Admin) — full access
  for (const roleId of user.roleIds) {
    const role = await ctx.db.get(roleId)
    if (role && role.isSystem) return true
  }

  // Look up resource by name
  const resource = await ctx.db
    .query(TABLE_RESOURCES)
    .withIndex('by_name', (q) => q.eq('name', resourceName))
    .unique()
  if (!resource) return false

  // Check permissions for each role
  for (const roleId of user.roleIds) {
    const perm = await ctx.db
      .query(TABLE_PERMISSIONS)
      .withIndex('by_role_resource', (q) =>
        q.eq('roleId', roleId).eq('resourceId', resource._id),
      )
      .unique()
    if (perm && perm.actions.includes(action)) return true
  }

  return false
}

export async function getResolvedPermissions(
  ctx: Ctx,
  userId: Id<typeof TABLE_USERS>,
): Promise<Record<string, string[]>> {
  const user = await ctx.db.get(userId)
  if (!user) return {}

  if (!user.roleIds || user.roleIds.length === 0) return {}

  // Check if any role is Admin (isSystem)
  for (const roleId of user.roleIds) {
    const role = await ctx.db.get(roleId)
    if (role && role.isSystem) {
      // Admin gets full CRUD on all resources
      const resources = await ctx.db.query(TABLE_RESOURCES).collect()
      const result: Record<string, string[]> = {}
      for (const res of resources) {
        result[res.name] = ['create', 'read', 'update', 'delete']
      }
      return result
    }
  }

  const result: Record<string, string[]> = {}

  // Merge permissions across all roles
  for (const roleId of user.roleIds) {
    const perms = await ctx.db
      .query(TABLE_PERMISSIONS)
      .withIndex('by_roleId', (q) => q.eq('roleId', roleId))
      .collect()

    for (const perm of perms) {
      const resource = await ctx.db.get(perm.resourceId)
      if (!resource) continue

      if (!result[resource.name]) {
        result[resource.name] = []
      }
      for (const action of perm.actions) {
        if (!result[resource.name]!.includes(action)) {
          result[resource.name]!.push(action)
        }
      }
    }
  }

  return result
}
