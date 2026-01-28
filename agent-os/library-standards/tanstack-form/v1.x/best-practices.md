# @tanstack/react-form v1.x Best Practices

## Rules

- NEVER use `@tanstack/zod-form-adapter`. v1 uses Standard Schema natively -- pass Zod schemas directly.
- ALWAYS call `e.preventDefault()` and `e.stopPropagation()` in the form's `onSubmit` handler.
- PREFER `form.Field` (bound component) over standalone `Field` or `useField`.
- USE `createFormHook` + `useAppForm` for reusable field components across forms.
- ALWAYS set `onChangeAsyncDebounceMs` when using `onChangeAsync` validators.

## Form Setup

```tsx
import { useForm } from "@tanstack/react-form";

const form = useForm({
  defaultValues: { name: "", email: "" },
  onSubmit: async ({ value }) => {
    await saveData(value);
  },
});

return (
  <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
    {/* fields */}
  </form>
);
```

## Field Components

```tsx
<form.Field name="email">
  {(field) => (
    <input
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

Array fields use `mode="array"` with `field.pushValue()`, `field.removeValue(index)`.

## Zod Validation (Standard Schema -- no adapter needed)

```tsx
import { z } from "zod";

// Form-level: pass schema directly to validators
const form = useForm({
  defaultValues: { name: "", email: "" },
  validators: {
    onChange: z.object({
      name: z.string().min(2),
      email: z.string().email(),
    }),
  },
  onSubmit: async ({ value }) => { /* ... */ },
});

// Field-level: pass schema directly
<form.Field name="email" validators={{ onChange: z.string().email() }}>
  {(field) => (/* ... */)}
</form.Field>
```

## Async Validation

```tsx
<form.Field
  name="username"
  validators={{
    onChangeAsync: async ({ value }) => {
      const taken = await checkUsername(value);
      return taken ? "Username taken" : undefined;
    },
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => (/* ... */)}
</form.Field>
```

## Submission Handling

```tsx
<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? "Saving..." : "Save"}
    </button>
  )}
</form.Subscribe>
```

## createFormHook (Reusable Field Components)

```tsx
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldComponents: { TextField, SelectField },
  formComponents: { SubmitButton },
  fieldContext,
  formContext,
});

// Usage: form.AppField renders with custom components injected
```

## Common Pitfalls

- Do NOT forget `e.stopPropagation()` -- nested forms will double-submit.
- Do NOT use `@tanstack/zod-form-adapter` -- it does not exist in v1. Zod 3.24+ implements Standard Schema.
- Errors are arrays: check `field.state.meta.errors.length > 0`, not truthiness.
- `onBlur` validators only fire after `field.handleBlur` is called -- always bind it.
- `form.Subscribe` re-renders on every state change without a `selector` -- always pass one.
