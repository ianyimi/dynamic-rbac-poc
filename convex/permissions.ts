import { v } from 'convex/values'

import { TABLE_RESOURCES, TABLE_USERS } from '~/db/constants'

import { query } from './_generated/server'
import { getResolvedPermissions as resolvePerms } from './lib/permissions'

export const getResolvedPermissions = query({
  args: { userId: v.id(TABLE_USERS) },
  handler: async (ctx, args) => {
    return await resolvePerms(ctx, args.userId)
  },
})

export const listResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query(TABLE_RESOURCES).collect()
  },
})
