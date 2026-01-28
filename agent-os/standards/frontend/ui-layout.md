# UI Layout

## Context

Standards for the single-page RBAC dashboard layout. Two-column design with control panel and resource dashboard.

## Page Structure

Single route (`/`) with two-column layout:

```
┌─────────────────────────────────────────────┐
│ Top Bar: Title | GitHub Link | User Selector│
├──────────────────┬──────────────────────────┤
│ Left: Controls   │ Right: Resource Cards    │
│ - User Simulator │ - Telemetry Data        │
│ - Role Manager   │ - Mission Reports       │
│ - Role Assignment│ - System Logs           │
│                  │ - User Management       │
└──────────────────┴──────────────────────────┘
```

## Layout Implementation

- Use CSS Grid or Tailwind `grid grid-cols-[380px_1fr]` for two-column
- Left column: fixed-width, scrollable independently
- Right column: responsive grid of resource cards
- Cards: shadcn `Card` component with consistent spacing

## Resource Card States

Two visual states per resource card:

```tsx
// Authorized: show content + action badges
<Card>
  <CardHeader>{resource.label}</CardHeader>
  <CardContent>{sampleData}</CardContent>
  <CardFooter>
    <Badge>read</Badge>
    <Badge>update</Badge>
  </CardFooter>
</Card>

// Unauthorized: lock icon, muted styling
<Card className="opacity-60">
  <CardHeader>{resource.label}</CardHeader>
  <CardContent><Lock /> Unauthorized</CardContent>
</Card>
```

## Real-Time Updates

- Convex subscriptions auto-update when permissions change
- No manual refetching needed — UI reacts to permission mutations
- User switcher changes state, triggering re-evaluation of all cards

## Common Pitfalls

- Don't use separate routes — everything lives on one page
- Don't lazy-load the resource cards — they're always visible
- Don't add mobile breakpoints — desktop-only demo
