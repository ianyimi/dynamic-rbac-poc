import { v } from 'convex/values'

import { TABLE_SYSTEM_LOGS, TABLE_USERS } from '~/db/constants'

import { mutation, query } from './_generated/server'
import { checkPermission } from './lib/permissions'

export const listSystemLogs = query({
  args: { callerUserId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_SYSTEM_LOGS, 'read')
    if (!allowed) return null
    return await ctx.db.query(TABLE_SYSTEM_LOGS).collect()
  },
})

export const createSystemLog = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    timestamp: v.number(),
    level: v.string(),
    message: v.string(),
    acknowledged: v.boolean(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_SYSTEM_LOGS, 'create')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, ...data } = args
    return await ctx.db.insert(TABLE_SYSTEM_LOGS, data)
  },
})

export const updateSystemLog = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_SYSTEM_LOGS),
    timestamp: v.optional(v.number()),
    level: v.optional(v.string()),
    message: v.optional(v.string()),
    acknowledged: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_SYSTEM_LOGS, 'update')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const deleteSystemLog = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_SYSTEM_LOGS),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_SYSTEM_LOGS, 'delete')
    if (!allowed) throw new Error('Permission denied')
    await ctx.db.delete(args.id)
  },
})
