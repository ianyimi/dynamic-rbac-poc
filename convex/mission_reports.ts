import { v } from 'convex/values'

import { TABLE_MISSION_REPORTS, TABLE_USERS } from '~/db/constants'

import { mutation, query } from './_generated/server'
import { checkPermission } from './lib/permissions'

export const listMissionReports = query({
  args: { callerUserId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_MISSION_REPORTS, 'read')
    if (!allowed) return null
    return await ctx.db.query(TABLE_MISSION_REPORTS).collect()
  },
})

export const createMissionReport = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    title: v.string(),
    author: v.string(),
    classification: v.string(),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_MISSION_REPORTS, 'create')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, ...data } = args
    return await ctx.db.insert(TABLE_MISSION_REPORTS, data)
  },
})

export const updateMissionReport = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_MISSION_REPORTS),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    classification: v.optional(v.string()),
    approved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_MISSION_REPORTS, 'update')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const deleteMissionReport = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_MISSION_REPORTS),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_MISSION_REPORTS, 'delete')
    if (!allowed) throw new Error('Permission denied')
    await ctx.db.delete(args.id)
  },
})
