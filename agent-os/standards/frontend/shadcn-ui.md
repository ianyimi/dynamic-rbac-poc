## shadcn/ui v3.x Best Practices

### How shadcn Works
- shadcn/ui is NOT a dependency. Components are copied into your codebase via CLI.
- You own the code. Components live in `src/components/ui/` and are fully editable.
- Built on `@base-ui/react` primitives (NOT Radix as in v1.x). Do not import from `@radix-ui`.
- Styling uses `class-variance-authority` (cva) for variants + `cn()` from `~/lib/utils`.
- Components use `data-slot` attributes for CSS targeting and composition.

### CLI Usage (npx shadcn)
- Add components: `npx shadcn@latest add button card dialog`
- Add multiple at once to batch: `npx shadcn@latest add button input label`
- List available: `npx shadcn@latest add` (interactive picker)
- Diff against upstream: `npx shadcn@latest diff`
- Config lives in `components.json` at project root. Do not edit aliases manually.
- This project uses style `base-vega`, icon library `lucide`, CSS variables enabled.

### Component Customization
- ALWAYS edit the copied file directly. Never patch via wrapper unless composition demands it.
- Extend variants in the `cva()` call, not by adding conditional className logic.
- Keep `data-slot` attributes intact; they enable parent-child CSS targeting.
- Use `cn()` for all className merging. Never concatenate strings.
- Preserve the component's prop interface (`VariantProps<typeof xxxVariants>`).
- When adding a variant, add it to both the `cva` definition and the TypeScript type.

### Composition Patterns
- Compose from primitives: e.g., build a `FormField` from `Label` + `Input` + error text.
- Use `data-slot` for scoped styling: `[&_[data-slot=icon]]:size-4`.
- Forward refs and spread `...props` to the root primitive element.
- Prefer named exports: `export { Button, buttonVariants }`.
- For complex components (Combobox, DataTable), keep sub-components in the same file.
- Wrap shadcn components in domain components (e.g., `RoleSelect` wraps `Select`).

### Tailwind & Theming
- Use semantic color tokens: `bg-primary`, `text-muted-foreground`, not raw colors.
- Theme customization goes in `src/styles.css` via CSS custom properties, not Tailwind config.
- Dark mode uses `dark:` prefix. All components must support both modes.
- Use `--radius` CSS variable for consistent border radius.

### Common Pitfalls
- DO NOT install shadcn as an npm package. It is a CLI tool only.
- DO NOT import from `@radix-ui/*`. v3.x uses `@base-ui/react/*` primitives.
- DO NOT remove `data-slot` attributes; other components depend on them for styling.
- DO NOT create wrapper components just to add className; edit the source file instead.
- DO NOT use `!important` to override styles; use proper variant or `cn()` merging.
- After running `npx shadcn add`, review the diff. CLI may overwrite your customizations.
- Run `npx shadcn diff` before updating to check what changed upstream.

### File Organization
- UI primitives: `src/components/ui/` (shadcn-managed, editable)
- Domain components: `src/components/` (your compositions using UI primitives)
- Utility: `src/lib/utils.ts` (cn helper, shared utilities)
- Hooks: `src/hooks/` (component-related hooks)
