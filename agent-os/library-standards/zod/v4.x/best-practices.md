# Zod 4 Best Practices

## Context
Standards for Zod 4 (published as `zod@3.25.x`). Apply these patterns for schema validation and type inference. Zod 4 is a ground-up rewrite with new APIs and deprecations.

## Core Concepts
- **Schemas are validators**: Every schema parses unknown input and returns typed output or throws.
- **Type inference**: Use `z.output<typeof schema>` / `z.input<T>` to derive TS types.
- **Immutability**: All schema methods return new instances. Schemas are never mutated.
- **Functional API**: Zod 4 exposes top-level `z.parse()`, `z.safeParse()` alongside method-based.

## Best Practices

### Prefer `safeParse` over `parse` for user input
Never use `parse` in request handlers; catch-based flow control is slower.
```typescript
const result = z.safeParse(UserSchema, input);
if (!result.success) return { errors: z.flattenError(result.error) };
```

### Use `z.output<T>` and `z.input<T>` for type extraction
```typescript
const UserSchema = z.object({ name: z.string(), age: z.coerce.number() });
type User = z.output<typeof UserSchema>;
type UserInput = z.input<typeof UserSchema>;
```

### Use `.check()` instead of `.superRefine()`
`.superRefine()` is deprecated. Use `.check()` for custom validations.
```typescript
const Password = z.string().check((val) => {
  if (val.length < 8) return "Must be at least 8 characters";
});
```

### Use `z.config()` instead of `setErrorMap`
```typescript
z.config({ customError: myErrorMap });
```

### Register metadata with registries
```typescript
const Email = z.string().email().meta({ description: "User email" });
const Name = z.string().describe("Full name"); // shorthand
```

### Use `z.toJSONSchema()` for OpenAPI/JSON Schema
```typescript
const jsonSchema = z.toJSONSchema(UserSchema);
```

### Use `.pipe()` for multi-step transforms, `.overwrite()` for mutation
```typescript
const StringToNum = z.string().pipe(z.coerce.number().positive());
const Trimmed = z.string().overwrite((s) => s.trim());
```

## Common Pitfalls
- **Do not use `._def`**: Use `.def` instead (deprecated compat alias).
- **Do not use `ZodTypeAny`/`ZodSchema`**: Use `z.ZodType` without generics.
- **Do not use `ZodIssueCode` enum**: Use raw string literals like `"invalid_type"`.
- **Do not use `setErrorMap`/`getErrorMap`**: Use `z.config()`.
- **Import path**: `import { z } from "zod"` gives v4. Use `"zod/v3"` only for compat.
- **Async**: Use `parseAsync`/`safeParseAsync` when schemas have async refinements.
- **`.optional()` vs `.nullish()`**: `.optional()` = undefined only. `.nullish()` = null | undefined.

## What Changed from Zod 3
- Ground-up rewrite: 2-7x faster parsing, 50% smaller bundle.
- Top-level functional API: `z.parse(schema, data)`, `z.safeParse(schema, data)`.
- `.check()` replaces `.superRefine()` for custom validation.
- `z.config()` replaces `z.setErrorMap()`.
- New: registries (`z.registry()`, `z.globalRegistry`) for schema metadata.
- New: `z.toJSONSchema()` built-in (no external library needed).
- New: `.overwrite()` for mutation, `.prefault()` for pre-parse defaults.
- New: `z.iso.datetime()`, `z.iso.date()`, `z.iso.time()` for ISO validation.
- New: `z.prettifyError()`, `z.treeifyError()`, `z.formatError()`.
- Deprecated: `.superRefine()`, `._def`, `ZodTypeAny`, `ZodIssueCode`, `setErrorMap`.
