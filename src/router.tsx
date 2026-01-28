import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { ConvexQueryClient } from "@convex-dev/react-query"
import { env } from '~/env'
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const CONVEX_URL = env.VITE_CONVEX_URL!

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
    expectAuth: true
  })
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn()
      }
    }
  })
  convexQueryClient.connect(queryClient)

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient, convexQueryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient
  })

  return router
}
