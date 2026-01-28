import { createAuthClient } from "better-auth/react"
import { adminClient, apiKeyClient } from "better-auth/client/plugins"
import { env } from '~/env';

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: env.VITE_SITE_URL, // Point to TanStack Start, which proxies to Convex
  plugins: [
    adminClient(),
    apiKeyClient()
  ]
})

export const { signIn, signOut, useSession } = authClient

// copied from code example, unsure if this is actually useful or not
// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-empty-function
authClient.$store.listen('$sessionSignal', async () => { })

