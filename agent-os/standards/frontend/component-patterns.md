# Component Patterns

## Context

Standards for React component structure in this TanStack Start + shadcn project. Based on established codebase conventions.

## File Naming

- UI primitives (shadcn): `kebab-case.tsx` in `src/components/ui/`
- Feature components: `kebab-case.tsx` in `src/components/`
- Route files: TanStack Router conventions (`index.tsx`, `$param.tsx`)

## Export Conventions

- **Named exports only** — no default exports anywhere
- Multiple related components in one file (compound pattern)

```tsx
// Good: compound component exports
export function RoleCard({ ... }) { ... }
export function RoleCardHeader({ ... }) { ... }
export function RoleCardActions({ ... }) { ... }
```

## Component Structure

- Extend native element props via `React.ComponentProps<'element'>`
- Use `data-slot` attributes for styling hooks
- Spread remaining props onto root element

```tsx
function ResourceCard({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="resource-card" className={cn('...', className)} {...props}>
      {children}
    </div>
  )
}
```

## Styling

- All styling via Tailwind classes + `cn()` utility
- Variants via `class-variance-authority` (CVA)
- Never use inline styles or CSS modules

```tsx
const cardVariants = cva('rounded-lg border p-4', {
  variants: {
    state: {
      authorized: 'border-border',
      unauthorized: 'border-destructive/50 opacity-60',
    },
  },
})
```

## TypeScript

- `import type` for type-only imports
- `satisfies` for type narrowing without widening
- Path aliases: `~/` for `src/`, `@convex/` for `convex/`

## Common Pitfalls

- Don't create wrapper components for single-use cases — inline the JSX
- Don't add `React.FC` — use plain function declarations
- Don't forget `key` props in mapped lists of role/permission cards
