import { v } from 'convex/values'

import { TABLE_ROLES, TABLE_USERS } from '~/db/constants'

import { type Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { checkPermission } from './lib/permissions'

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query(TABLE_USERS).collect()
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await Promise.all(
          user.roleIds.map(async (roleId) => {
            const role = await ctx.db.get(roleId)
            return role
          }),
        )
        return { ...user, roles: roles.filter(Boolean) }
      }),
    )
    return usersWithRoles
  },
})

export const getUser = query({
  args: { userId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

/**
 * Returns which roles the caller can toggle for each user.
 * The UI uses this to disable role buttons — no business logic in components.
 *
 * Rules encoded here:
 * 1. Caller must have "update" on "user_management" to toggle any role
 * 2. Only super admins can add/remove the Admin (isSystem) role
 * 3. A super admin's Admin role can never be removed by anyone
 */
export const getRoleAssignmentConstraints = query({
  args: { callerUserId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    const caller = await ctx.db.get(args.callerUserId)
    if (!caller) return { canUpdate: false, lockedRoles: {} }

    const canUpdate = await checkPermission(ctx, args.callerUserId, 'user_management', 'update')

    if (!canUpdate) {
      return { canUpdate: false, lockedRoles: {} }
    }

    // Find system roles (Admin)
    const allRoles = await ctx.db.query(TABLE_ROLES).collect()
    const systemRoleIds = allRoles.filter((r) => r.isSystem).map((r) => r._id)

    // Build a map of userId -> roleId[] that are locked (cannot be toggled)
    const users = await ctx.db.query(TABLE_USERS).collect()
    const lockedRoles: Record<string, string[]> = {}

    for (const user of users) {
      const locked: Id<'roles'>[] = []

      for (const sysRoleId of systemRoleIds) {
        // Non-super-admin callers can never toggle system roles
        if (!caller.isSuperAdmin) {
          locked.push(sysRoleId)
          continue
        }
        // Super admin's own system roles are permanently locked
        if (user.isSuperAdmin && user.roleIds.includes(sysRoleId)) {
          locked.push(sysRoleId)
        }
      }

      if (locked.length > 0) {
        lockedRoles[user._id] = locked
      }
    }

    return { canUpdate: true, lockedRoles }
  },
})

export const updateUserRoles = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    userId: v.id(TABLE_USERS),
    roleIds: v.array(v.id(TABLE_ROLES)),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, 'user_management', 'update')
    if (!allowed) {
      throw new Error('Permission denied: cannot update user roles')
    }

    const caller = await ctx.db.get(args.callerUserId)
    const targetUser = await ctx.db.get(args.userId)
    if (!targetUser) throw new Error('User not found')

    // Enforce system role constraints
    const allRoles = await ctx.db.query(TABLE_ROLES).collect()
    const systemRoleIds = new Set(allRoles.filter((r) => r.isSystem).map((r) => r._id))

    for (const sysRoleId of systemRoleIds) {
      const had = targetUser.roleIds.includes(sysRoleId)
      const willHave = args.roleIds.includes(sysRoleId)

      if (had !== willHave) {
        if (!caller?.isSuperAdmin) {
          throw new Error('Only super admins can modify system role assignments')
        }
        if (targetUser.isSuperAdmin && had && !willHave) {
          throw new Error('Cannot remove a system role from a super admin')
        }
      }
    }

    await ctx.db.patch(args.userId, { roleIds: args.roleIds })
  },
})
