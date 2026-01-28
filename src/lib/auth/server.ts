import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start"
import { env } from "~/env"

// Use the handler from the setup guide (it's just a proxy, works with custom adapter)
export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthAction,
  fetchAuthMutation
} = convexBetterAuthReactStart({
  convexUrl: env.VITE_CONVEX_URL!,
  convexSiteUrl: env.VITE_CONVEX_SITE_URL!
})
