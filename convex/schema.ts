import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

import {
  TABLE_MISSION_REPORTS,
  TABLE_PERMISSIONS,
  TABLE_RESOURCES,
  TABLE_ROLES,
  TABLE_SYSTEM_LOGS,
  TABLE_TELEMETRY_DATA,
  TABLE_USERS,
} from '~/db/constants'

export default defineSchema({
  [TABLE_USERS]: defineTable({
    name: v.string(),
    email: v.string(),
    roleIds: v.array(v.id(TABLE_ROLES)),
    isSuperAdmin: v.optional(v.boolean()),
  }).index('by_email', ['email']),

  [TABLE_RESOURCES]: defineTable({
    name: v.string(),
    label: v.string(),
    description: v.string(),
    isSystem: v.boolean(),
  }).index('by_name', ['name']),

  [TABLE_ROLES]: defineTable({
    name: v.string(),
    description: v.string(),
    isSystem: v.boolean(),
  }).index('by_name', ['name']),

  [TABLE_PERMISSIONS]: defineTable({
    roleId: v.id(TABLE_ROLES),
    resourceId: v.id(TABLE_RESOURCES),
    actions: v.array(v.string()),
  })
    .index('by_role_resource', ['roleId', 'resourceId'])
    .index('by_roleId', ['roleId']),

  [TABLE_TELEMETRY_DATA]: defineTable({
    timestamp: v.number(),
    sensorName: v.string(),
    value: v.number(),
    status: v.boolean(),
  }),

  [TABLE_MISSION_REPORTS]: defineTable({
    title: v.string(),
    author: v.string(),
    classification: v.string(),
    approved: v.boolean(),
  }),

  [TABLE_SYSTEM_LOGS]: defineTable({
    timestamp: v.number(),
    level: v.string(),
    message: v.string(),
    acknowledged: v.boolean(),
  }),
})
