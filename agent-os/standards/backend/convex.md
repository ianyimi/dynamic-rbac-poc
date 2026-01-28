# Convex v1.x Best Practices (v1.31+)

## Schema Definition
- Always use `defineSchema` + `defineTable` with `v` validators. Never store untyped data.
- Use `v.id("tableName")` for foreign keys instead of plain `v.string()`.
- Add `.index("by_field", ["field"])` for every field used in `.withIndex()` queries.
- Use `v.optional(v.union(v.null(), v.string()))` for nullable optional fields.
- Keep table name constants in a shared file; reference via `[TABLE_SLUG]` computed keys.
```ts
export default defineSchema({
  tasks: defineTable({
    userId: v.id("users"), text: v.string(),
    completed: v.boolean(), createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_completed", ["completed", "createdAt"]),
});
```

## Queries
- Use `query()` for client-facing reads, `internalQuery()` for server-only reads.
- Always declare `args` with `v` validators -- even if empty: `args: {}`.
- Prefer `.withIndex("by_field", q => q.eq("field", val))` over `.filter()` for performance.
- Use `.paginate(paginationOpts)` for large result sets; never `.collect()` unbounded tables.
- Queries are automatically reactive -- no extra subscription setup needed on the client.
```ts
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db.query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

## Mutations
- Use `mutation()` for client-facing writes, `internalMutation()` for server-only.
- Mutations are transactional -- all reads/writes in a handler are atomic.
- Use `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.replace()`, `ctx.db.delete()`.
- Prefer `patch` over `replace` for partial updates.
- Return the created/updated doc ID or relevant data for client confirmation.

## Actions & HTTP
- Use `action()` for non-deterministic work (external APIs, file storage).
- Actions cannot read/write DB directly; call mutations/queries via `ctx.runMutation()`.
- Use `httpRouter()` + `httpAction()` for custom HTTP endpoints (webhooks, auth).
- Register routes with `http.route({ path, method, handler })` or `pathPrefix` for wildcards.

## Real-time Subscriptions
- Every `useQuery(api.module.queryName, args)` auto-subscribes; updates push to client.
- Do NOT poll or refetch -- Convex handles reactivity automatically.
- Use `@convex-dev/react-query` for TanStack Query integration.
- Avoid expensive computation in queries -- they re-run on every relevant DB change.
- Pass `"skip"` as args to conditionally disable a subscription.

## Authorization & RBAC
- Check identity with `ctx.auth.getUserIdentity()` at the top of every query/mutation.
- Define roles/permissions as typed constants; use `satisfies` for type safety.
- Use function-based permission checks for row-level security: `(data, user) => boolean`.
- Keep permission logic in a shared module importable by both server and client.
- For internal-only functions, use `internalQuery`/`internalMutation` (not callable from client).
```ts
const ROLES = {
  admin: { tasks: { create: true, read: true, delete: true } },
  user: { tasks: {
    read: ({ data, user }) => data.userId === user._id,
    delete: ({ data, user }) => data.userId === user._id,
  }},
} as const satisfies RolesWithPermissions;
```

## Common Pitfalls
- **No `.collect()` on large tables** -- use `.take(n)`, `.first()`, or `.paginate()`.
- **Missing index** -- `.filter()` scans the entire table; always use `.withIndex()`.
- **Mutating in queries** -- queries must be pure reads; use mutations for writes.
- **Unbounded `Promise.all`** -- Convex limits concurrent DB ops per transaction.
- **Storing Dates as Date objects** -- use `v.number()` with `Date.now()`.
- **Forgetting `v.optional()`** -- new fields on existing tables require optional or migration.
- **Using `v.any()` in args** -- loses type safety; prefer explicit validators.
