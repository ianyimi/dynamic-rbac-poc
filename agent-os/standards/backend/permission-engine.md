# Permission Engine

## Context

Standards for the two-tier RBAC permission evaluation system. System constraints are immutable; user-defined roles operate within those bounds.

## Permission Evaluation

```typescript
// Core evaluation: union of all role permissions
function hasPermission(
  userPermissions: Permission[],
  resourceName: string,
  action: string,
): boolean {
  return userPermissions.some(
    (p) => p.resourceName === resourceName && p.actions.includes(action),
  )
}
```

**Rules:**
1. Get all roles assigned to the user
2. For each role, look up permissions for the target resource
3. Union all actions across all roles — if ANY role grants it, the user has it
4. Admin role bypasses evaluation — always returns true

## Two-Tier Architecture

**Tier 1 — System-defined (immutable):**
- Resources are seeded and cannot be created/modified/deleted from UI
- Admin role is protected — cannot be deleted or have permissions modified
- Action types are hardcoded: `create`, `read`, `update`, `delete`

**Tier 2 — User-defined (flexible within bounds):**
- Roles can be created, modified, deleted (except Admin)
- Permissions can assign any subset of actions to any resource for any role
- Users can be assigned/unassigned any combination of roles

## Server-Side Checks

Every Convex query/mutation that returns resource data must check permissions:

```typescript
export const getTelemetry = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const canRead = await checkPermission(ctx, userId, 'telemetry', 'read')
    if (!canRead) return { authorized: false, data: null }
    const data = await ctx.db.query('telemetryData').collect()
    return { authorized: true, data }
  },
})
```

## Client-Side Checks

Client checks are for UI gating only — never trust them for security:

```typescript
// Use resolved permissions from Convex query to show/hide UI
const permissions = useQuery(api.permissions.getUserPermissions, { userId })
const canRead = hasPermission(permissions, 'telemetry', 'read')
```

## Resolved Permissions

Precompute a user's full permission set for display:

```typescript
// Returns flat list: [{ resourceName, actions: string[] }]
// Merged across all of the user's roles
export const getUserPermissions = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    // Gather permissions from all roles, merge by resource
  },
})
```

## Common Pitfalls

- Don't check permissions client-side only — always enforce on Convex queries
- Don't intersect role permissions — union them (any role granting = granted)
- Don't allow permission assignment for non-existent resources
- Don't forget the Admin bypass — check `isSystem` on the role before DB lookup
