import { v } from 'convex/values'

import { TABLE_PERMISSIONS, TABLE_RESOURCES, TABLE_ROLES, TABLE_USERS } from '~/db/constants'

import { mutation, query } from './_generated/server'
import { checkPermission } from './lib/permissions'

export const listRoles = query({
  args: {},
  handler: async (ctx) => {
    const roles = await ctx.db.query(TABLE_ROLES).collect()
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const perms = await ctx.db
          .query(TABLE_PERMISSIONS)
          .withIndex('by_roleId', (q) => q.eq('roleId', role._id))
          .collect()
        const permissionsWithResource = await Promise.all(
          perms.map(async (perm) => {
            const resource = await ctx.db.get(perm.resourceId)
            return { ...perm, resourceName: resource?.name ?? '' }
          }),
        )
        return { ...role, permissions: permissionsWithResource }
      }),
    )
    return rolesWithPermissions
  },
})

export const createRole = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    name: v.string(),
    description: v.string(),
    permissions: v.array(
      v.object({
        resourceId: v.id(TABLE_RESOURCES),
        actions: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, 'role_management', 'create')
    if (!allowed) {
      throw new Error('Permission denied: cannot create roles')
    }

    const roleId = await ctx.db.insert(TABLE_ROLES, {
      name: args.name,
      description: args.description,
      isSystem: false,
    })

    for (const perm of args.permissions) {
      if (perm.actions.length > 0) {
        await ctx.db.insert(TABLE_PERMISSIONS, {
          roleId,
          resourceId: perm.resourceId,
          actions: perm.actions,
        })
      }
    }

    return roleId
  },
})

export const updateRole = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    roleId: v.id(TABLE_ROLES),
    name: v.string(),
    description: v.string(),
    permissions: v.array(
      v.object({
        resourceId: v.id(TABLE_RESOURCES),
        actions: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId)
    if (!role) throw new Error('Role not found')
    if (role.isSystem) throw new Error('Cannot update system roles')

    const allowed = await checkPermission(ctx, args.callerUserId, 'role_management', 'update')
    if (!allowed) {
      throw new Error('Permission denied: cannot update roles')
    }

    await ctx.db.patch(args.roleId, {
      name: args.name,
      description: args.description,
    })

    // Delete existing permissions for this role
    const existingPerms = await ctx.db
      .query(TABLE_PERMISSIONS)
      .withIndex('by_roleId', (q) => q.eq('roleId', args.roleId))
      .collect()
    for (const perm of existingPerms) {
      await ctx.db.delete(perm._id)
    }

    // Insert new permissions
    for (const perm of args.permissions) {
      if (perm.actions.length > 0) {
        await ctx.db.insert(TABLE_PERMISSIONS, {
          roleId: args.roleId,
          resourceId: perm.resourceId,
          actions: perm.actions,
        })
      }
    }
  },
})

export const deleteRole = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    roleId: v.id(TABLE_ROLES),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId)
    if (!role) throw new Error('Role not found')
    if (role.isSystem) throw new Error('Cannot delete system roles')

    const allowed = await checkPermission(ctx, args.callerUserId, 'role_management', 'delete')
    if (!allowed) {
      throw new Error('Permission denied: cannot delete roles')
    }

    // Delete permissions for this role
    const perms = await ctx.db
      .query(TABLE_PERMISSIONS)
      .withIndex('by_roleId', (q) => q.eq('roleId', args.roleId))
      .collect()
    for (const perm of perms) {
      await ctx.db.delete(perm._id)
    }

    // Remove roleId from all users that have it
    const allUsers = await ctx.db.query(TABLE_USERS).collect()
    for (const user of allUsers) {
      if (user.roleIds.includes(args.roleId)) {
        await ctx.db.patch(user._id, {
          roleIds: user.roleIds.filter((id) => id !== args.roleId),
        })
      }
    }

    await ctx.db.delete(args.roleId)
  },
})
