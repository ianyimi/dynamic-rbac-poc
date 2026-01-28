# React 19 Best Practices

## Context

Standards for React 19. Apply these patterns for component architecture, state management, and UI rendering.

## Core Concepts

- **Components are pure functions.** Same inputs (props, state, context) produce same output. No side effects during render.
- **Actions** handle async mutations with automatic pending state, error handling, and optimistic updates.
- **`use()` API** reads promises and context during render, supports conditional calls (unlike hooks).
- **Server Components** run on the server, have no bundle cost, and can access backend directly. No directive needed. Client Components use `"use client"`.
- **Ref as prop.** `forwardRef` is deprecated. Pass `ref` directly as a prop.

## Best Practices

### Hooks Rules (Enforced)

- Call hooks at the top level only. Never inside loops, conditions, or nested functions.
- Call hooks only from React function components or custom hooks.
- Never mutate props, state, or hook return values. Treat as immutable snapshots.

### Actions and Forms

Use `useActionState` for form submissions with pending/error state:

```tsx
const [error, submitAction, isPending] = useActionState(async (prev, formData) => {
  const err = await updateName(formData.get("name"));
  return err || null;
}, null);

<form action={submitAction}>
  <input name="name" />
  <button disabled={isPending}>Save</button>
</form>
```

Use `useOptimistic` for instant UI feedback:

```tsx
const [optimisticName, setOptimisticName] = useOptimistic(currentName);
```

Use `useFormStatus` to access parent form state without prop drilling:

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```

### Context and Refs

Use `<Context>` directly as provider (not `<Context.Provider>`):

```tsx
<ThemeContext value="dark">{children}</ThemeContext>
```

Ref callbacks support cleanup functions:

```tsx
<input ref={(el) => { /* setup */ return () => { /* cleanup */ }; }} />
```

Never use implicit returns in ref callbacks (TypeScript will reject them).

### Document Metadata

Render `<title>`, `<meta>`, `<link>` directly in components. React hoists them to `<head>`:

```tsx
function Page({ title }) {
  return <><title>{title}</title><main>...</main></>;
}
```

### Performance

- Use `useDeferredValue(value, initialValue)` for deferred rendering with an initial fallback.
- Use `useTransition` for async state updates that should not block UI.
- Use `<Suspense>` with stylesheets (`precedence` prop) to prevent layout shifts.

## Common Pitfalls

- **Do not create promises inside render** for `use()`. Create them outside or in a parent, or use a Suspense-compatible library.
- **Do not use `useFormState`**. It was renamed to `useActionState` before stable release.
- **Do not use `forwardRef`** for new code. Pass `ref` as a regular prop.
- **Do not use `<Context.Provider>`** in new code. Use `<Context value={...}>` directly.
- **Do not mutate state/props.** Always create new objects/arrays. The React Compiler assumes immutability.
- **Do not call component functions directly** (`MyComponent()`). Always use JSX (`<MyComponent />`).
- **Hydration mismatches** now show diffs. Fix server/client output differences rather than suppressing.

## Related Standards

- See [convex/best-practices.md](../../convex/v1.x/best-practices.md) for backend integration
- See [shadcn-ui/best-practices.md](../../shadcn-ui/v3.x/best-practices.md) for UI components
