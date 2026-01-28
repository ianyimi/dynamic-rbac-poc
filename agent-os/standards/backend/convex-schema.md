# Convex Schema Design

## Context

Standards for the RBAC data model in Convex. Four tables: resources, roles, permissions, users.

## Schema Definition

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  resources: defineTable({
    name: v.string(),        // "telemetry", "missions", "systemLogs", "users"
    label: v.string(),       // Display name
    description: v.string(),
    isSystem: v.boolean(),   // Always true for seeded resources
  }).index('by_name', ['name']),

  roles: defineTable({
    name: v.string(),
    description: v.string(),
    isSystem: v.boolean(),   // true for Admin only
  }).index('by_name', ['name']),

  permissions: defineTable({
    roleId: v.id('roles'),
    resourceId: v.id('resources'),
    actions: v.array(v.string()), // ["create", "read", "update", "delete"]
  })
    .index('by_role', ['roleId'])
    .index('by_role_resource', ['roleId', 'resourceId']),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    roleIds: v.array(v.id('roles')),
  }).index('by_email', ['email']),
})
```

## Conventions

- **Actions as string array** — not a separate table. Fixed set: `create`, `read`, `update`, `delete`
- **Compound indexes** — `by_role_resource` on permissions for fast permission lookups
- **System flag** — `isSystem: true` prevents deletion/modification from UI
- **Role IDs on user** — denormalized array for fast role lookup per user

## Seed Data

- Seed via a Convex mutation (not a script) so it runs in the Convex environment
- Use `db.insert` with idempotency check (query first, skip if exists)
- Seed resources, roles, permissions, and sample users

## Common Pitfalls

- Don't store actions as separate rows — array on the permission row is simpler
- Don't forget indexes on foreign key fields (`roleId`, `resourceId`)
- Don't allow mutations on resources with `isSystem: true` from user-facing mutations
- Don't use `db.patch` for permission actions — replace the whole array to avoid merge bugs
