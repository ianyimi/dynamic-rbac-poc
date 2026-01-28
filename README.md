# Dynamic RBAC POC

A single-page dashboard demonstrating a fully database-driven Role-Based Access Control (RBAC) system. All roles, permissions, and resource definitions live in Convex tables. The demo shows how CRUD permissions on 5 resource types are enforced in real-time as an admin modifies roles and assignments.

## Tech Stack

- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework
- **[Convex](https://convex.dev/)** - Real-time database and backend
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** + **[Base UI](https://base-ui.com/)** - UI components

## Architecture

**No real auth.** Users are switched via a clickable list in the sidebar; the active user ID is passed as an argument to every Convex function. Permission checks happen at two layers:

1. **Server-side** (Convex mutations/queries) — the source of truth, enforces all rules
2. **Client-side** (React hooks) — for UX gating only, disables controls the user can't use

### Why This Design Works

The permission system follows a single-entry-point pattern inspired by the [create-z3-stack](https://github.com/zayeddev/create-z3-stack) `hasPermission` function. In the original static version, all roles and their permissions are defined in a single `ROLES` constant, and every permission check flows through one function. This POC preserves that principle but makes it **database-driven**:

- **One function to check permissions**: `checkPermission(ctx, userId, resource, action)` in `convex/lib/permissions.ts`. Every mutation calls this. No permission logic lives anywhere else.
- **One function to resolve permissions**: `getResolvedPermissions(ctx, userId)` returns a flat map of `{ resource: actions[] }` for the client. The client's `hasPermission()` is a pure lookup into this map — zero logic.
- **One query for constraints**: `getRoleAssignmentConstraints(callerUserId)` tells the UI which role toggles are locked. Business rules (super admin, system roles) are encoded server-side and consumed as data.

The UI components contain **no business logic**. They fetch data, call `hasPermission()` or check a constraints map, and render accordingly. If requirements change, you modify the server-side functions — not the components.

## RBAC Model

### Core Tables

| Table | Purpose |
|-------|---------|
| `resources` | Defines what can be protected (telemetry_data, mission_reports, etc.) |
| `roles` | Named groups of permissions (Admin, Operator, Analyst, Viewer, custom) |
| `permissions` | Maps a role + resource to allowed actions (create/read/update/delete) |
| `users` | User accounts with an array of assigned role IDs |

### Permission Resolution

When a user is selected, the server resolves their effective permissions by merging across all assigned roles:

```
User (roleIds: [Operator, Analyst])
  -> Operator: telemetry_data [read, update], mission_reports [read]
  -> Analyst:  telemetry_data [read], mission_reports [read, update]
  = Resolved:  telemetry_data [read, update], mission_reports [read, update]
```

The resolved permission map is subscribed reactively via Convex — role or permission changes propagate to the UI instantly.

### System Roles and Super Admin

- **System roles** (`isSystem: true`): Cannot be edited or deleted. The Admin role is a system role that grants full CRUD on all resources.
- **Super admin** (`isSuperAdmin: true` on user): The only users who can add or remove system roles (like Admin) from other users. A super admin's own system roles can never be removed by anyone.

These constraints are enforced in two places:
1. `updateUserRoles` mutation — rejects the operation server-side
2. `getRoleAssignmentConstraints` query — tells the UI to disable the toggle, preventing the mutation from firing

### Seed Users

| User | Role | Super Admin | Access |
|------|------|-------------|--------|
| Alice Chen | Admin | Yes | Full CRUD on everything, can assign Admin role |
| Bob Martinez | Operator | No | R+U telemetry & logs, R reports |
| Carol Singh | Analyst | No | R all, U reports |
| Dave Kim | Viewer | No | R all |
| Eve Johnson | (none) | No | No access |

## Key Files

### Permission Engine (Server)

#### `convex/lib/permissions.ts`

The core of the system. Two functions:

- **`checkPermission(ctx, userId, resourceName, action)`** — Called by every mutation. Loads the user's roles, checks if any are system roles (instant full access), otherwise queries the permissions table for a match. Returns `boolean`.
- **`getResolvedPermissions(ctx, userId)`** — Called by the client permissions query. Builds the full `Record<resource, actions[]>` map by merging permissions across all user roles. System roles get full CRUD on everything.

#### `convex/users.ts`

- **`listUsers`** — Returns all users with their role data populated.
- **`getRoleAssignmentConstraints(callerUserId)`** — Returns `{ canUpdate, lockedRoles }`. Encodes all rules about who can toggle what: system role protection, super admin permanence. The UI consumes this as a simple lookup — `lockedRoles[userId]` contains role IDs that cannot be toggled.
- **`updateUserRoles(callerUserId, userId, roleIds)`** — Server-side enforcement mirror of the constraints. Checks `checkPermission` for user_management update, then validates system role changes against super admin rules.

#### `convex/roles.ts`

- **`createRole` / `updateRole` / `deleteRole`** — All gated by `checkPermission(ctx, callerUserId, 'role_management', action)`. System roles cannot be updated or deleted. Deleting a role cascades: removes its permission records and unassigns it from all users.

#### `convex/permissions.ts`

- **`getResolvedPermissions(userId)`** — Convex query that wraps `lib/permissions.ts`. Subscribed reactively by the client.
- **`listResources`** — Returns all resource definitions for the role editor UI.

### Permission Engine (Client)

#### `src/lib/auth/permissions.ts`

- **`hasPermission(permissions, resource, action)`** — Pure function. Looks up the pre-resolved permissions map. No database calls, no logic. Returns `boolean`.
- **`usePermissions(userId)`** — React hook that subscribes to `getResolvedPermissions` via Convex + React Query. Returns `{ permissions, hasPermission, isLoading }`.

#### `src/lib/auth/context.tsx`

- **`ActiveUserProvider`** — React context holding `activeUserId` state. No persistence — resets on refresh.
- **`useActiveUser()`** — Returns `{ activeUserId, setActiveUserId }`.

### UI Components

#### `src/components/resource-card.tsx`

Generic card for displaying CRUD data. Uses `hasPermission()` to gate controls:
- No READ permission: shows lock icon
- No CREATE: Add button disabled
- No UPDATE: fields are read-only (uses debounced inputs to avoid mutation spam)
- No DELETE: delete button disabled

#### `src/components/role-manager.tsx`

Role CRUD in the sidebar. Uses `hasPermission()` for create/update/delete on `role_management`. System roles show a "System" badge and have edit/delete disabled (driven by `isSystem` from the role document).

#### `src/components/user-management-card.tsx`

User list with role toggle buttons. Fetches `getRoleAssignmentConstraints` from the server and uses the returned `lockedRoles` map to disable buttons. Contains **no business logic** — just data-driven rendering.

#### `src/components/user-switcher.tsx`

Clickable user list in the sidebar. Click to impersonate, click again to deselect. Shows role badges per user. Not permission-gated (anyone can switch users — this is a demo tool, not real auth).

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Convex account ([convex.dev](https://convex.dev))

### Setup

```bash
pnpm install

# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: App dev server
pnpm dev
```

Visit `http://localhost:3010`. The database auto-seeds if no users exist, or use the Convex dashboard to add data manually (see `seed-data.md`).

### Environment

Copy `.env.example` to `.env.local` and set:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## How It Works

1. **Select a user** from the sidebar list to impersonate them
2. **Right panel** shows resource cards — data is visible with READ, locked without it
3. **Left panel** has the Role Manager — create, edit, and delete roles with a permission checkbox grid
4. **User Management card** (right panel) — toggle role assignments per user with green/red pills
5. **Modify roles** as Admin (Alice) and switch users to see changes take effect in real-time

### Key Behaviors

- Controls are always **visible** but **disabled** when lacking permissions
- Cards are **greyed out** when no user is selected
- Creating entries without READ shows a toast confirmation (can't see the result)
- Admin role is immutable (isSystem flag prevents edit/delete)
- Admin role assignment is restricted to super admins only
- Role/permission changes propagate instantly via Convex subscriptions
- Text field edits are **debounced** (500ms) to avoid excessive mutations

## Project Structure

```
src/
  components/           # Dashboard components
    resource-card.tsx   # Generic CRUD card with permission gating
    role-manager.tsx    # Role CRUD with permission checkbox grid
    user-management-card.tsx  # User list with role toggle buttons
    user-switcher.tsx   # User impersonation selector
  lib/auth/
    context.tsx         # Active user React context
    permissions.ts      # Client-side hasPermission + usePermissions hook
  routes/
    index.tsx           # Dashboard layout
    __root.tsx          # Root layout with providers
  db/constants/
    index.ts            # Table name constants used everywhere
convex/
  lib/permissions.ts    # Server-side permission engine (checkPermission + getResolvedPermissions)
  users.ts              # User queries/mutations + role assignment constraints
  roles.ts              # Role CRUD with permission checks
  permissions.ts        # Resolved permissions query + resource list
  telemetry_data.ts     # Telemetry CRUD
  mission_reports.ts    # Mission reports CRUD
  system_logs.ts        # System logs CRUD
  seed.ts               # Seed data
  schema.ts             # Database schema
```

## Future Considerations

Features considered but not implemented in this POC:

- **Row-level permissions**: The original `hasPermission` pattern supports function-based checks (e.g., "users can only edit their own reports"). The current system operates at the resource-type level only. Adding row-level checks would mean extending `checkPermission` to accept a `data` parameter and storing permission functions or conditions in the database.
- **Permission inheritance / role hierarchy**: Roles are flat — no parent/child relationships. A "Manager" role doesn't automatically include "Viewer" permissions. Each role's permissions are defined independently.
- **Field-level permissions**: All fields in a resource are either editable or not. There's no concept of "can edit the title but not the classification."
- **Temporal permissions**: No time-based access (e.g., "access expires after 30 days"). Would require a TTL or expiry field on user-role assignments.
- **Audit logging**: No record of who changed what permission when. Would be straightforward to add as a Convex mutation wrapper that logs before/after state.
- **Multi-tenancy / organization scoping**: The original webapp-v2 permissions file supports organization hierarchy checks (school/district/county). This POC has no org concept — all users see all data.
- **Real authentication**: The user switcher is a demo tool. In production, the active user would come from a session/JWT, not a React state variable.

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm typecheck    # Type check
pnpm lint         # Lint
pnpm validate     # Typecheck + lint + format check
```
