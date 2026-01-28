# Tech Stack

## Framework & Runtime

- **Application Framework:** TanStack Start v1.132 (via create-z3-app)
- **Language/Runtime:** TypeScript 5.7 / Node.js
- **Package Manager:** pnpm 10.25

## Frontend

- **JavaScript Framework:** React 19.2
- **Routing:** TanStack Router v1.132 (file-based)
- **Forms:** TanStack React Form v1.28
- **CSS Framework:** Tailwind CSS v4.0
- **UI Components:** shadcn/ui (copy-paste, not a dependency)
- **Icons:** lucide-react
- **Class Utilities:** clsx + tailwind-merge via `cn()`, CVA for variants

## Backend & Database

- **Backend/Database:** Convex v1.31 (reactive BaaS with real-time subscriptions)
- **Schema/Validation:** Zod v4.2 (environment validation), Convex validators (schema)

## Testing & Quality

- **Linting:** ESLint with @tanstack/eslint-config
- **Formatting:** Prettier with Tailwind + import sort plugins
- **TypeScript:** Strict mode with all extra checks enabled

## Deployment

- **Hosting:** Vercel
- **Backend Hosting:** Convex Cloud (managed)

## Authentication

- None — simulated user switching via UI dropdown (POC scope)
