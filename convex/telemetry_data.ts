import { v } from 'convex/values'

import { TABLE_TELEMETRY_DATA, TABLE_USERS } from '~/db/constants'

import { mutation, query } from './_generated/server'
import { checkPermission } from './lib/permissions'

export const listTelemetryData = query({
  args: { callerUserId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_TELEMETRY_DATA, 'read')
    if (!allowed) return null
    return await ctx.db.query(TABLE_TELEMETRY_DATA).collect()
  },
})

export const createTelemetryData = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    timestamp: v.number(),
    sensorName: v.string(),
    value: v.number(),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_TELEMETRY_DATA, 'create')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, ...data } = args
    return await ctx.db.insert(TABLE_TELEMETRY_DATA, data)
  },
})

export const updateTelemetryData = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_TELEMETRY_DATA),
    timestamp: v.optional(v.number()),
    sensorName: v.optional(v.string()),
    value: v.optional(v.number()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_TELEMETRY_DATA, 'update')
    if (!allowed) throw new Error('Permission denied')
    const { callerUserId: _, id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const deleteTelemetryData = mutation({
  args: {
    callerUserId: v.id(TABLE_USERS),
    id: v.id(TABLE_TELEMETRY_DATA),
  },
  handler: async (ctx, args) => {
    const allowed = await checkPermission(ctx, args.callerUserId, TABLE_TELEMETRY_DATA, 'delete')
    if (!allowed) throw new Error('Permission denied')
    await ctx.db.delete(args.id)
  },
})
