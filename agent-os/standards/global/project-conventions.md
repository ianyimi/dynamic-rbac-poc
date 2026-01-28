# Project Conventions

## Context

TypeScript conventions and project-wide patterns for this TanStack Start + Convex RBAC POC.

## TypeScript

- **Strict mode** with all extra checks enabled (`noUncheckedIndexedAccess`, `noImplicitReturns`, etc.)
- Use `satisfies` for type narrowing without widening
- Use `import type` for type-only imports
- Use `as const` for immutable type inference on constants

```typescript
import type { Id, Doc } from '@convex/_generated/dataModel'

const ACTIONS = ['create', 'read', 'update', 'delete'] as const
type Action = (typeof ACTIONS)[number]
```

## Path Aliases

- `~/` → `src/` (application code)
- `@convex/` → `convex/` (Convex functions and schema)

## File Organization

```
src/components/ui/     → shadcn primitives (kebab-case)
src/components/        → feature components (kebab-case)
src/lib/               → utilities and shared logic
src/db/                → type definitions and constants
src/routes/            → TanStack Router file-based routes
convex/                → backend functions and schema
```

## Naming

- Files: `kebab-case.tsx` / `kebab-case.ts`
- Components: `PascalCase` function names
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects
- Convex tables: `camelCase` singular (`roles`, `permissions`, `resources`, `users`)

## Exports

- Named exports only — no default exports
- Re-export from `index.ts` barrel files where logical grouping exists

## Common Pitfalls

- Don't use `any` — use `unknown` and narrow with type guards
- Don't use `React.FC` — use plain function declarations
- Don't create unnecessary abstractions — this is a POC, keep it direct
