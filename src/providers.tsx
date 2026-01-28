import type { ReactNode } from 'react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { Toaster } from 'sonner'

import { ActiveUserProvider } from '~/lib/auth/context'
import { env } from '~/env'

const CONVEX_URL = env.VITE_CONVEX_URL!

const convexClient = new ConvexReactClient(CONVEX_URL)

const convexQueryClient = new ConvexQueryClient(convexClient)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      staleTime: 1000 * 60,
    },
  },
})
convexQueryClient.connect(queryClient)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convexClient}>
      <QueryClientProvider client={queryClient}>
        <ActiveUserProvider>
          {children}
          <Toaster />
        </ActiveUserProvider>
      </QueryClientProvider>
    </ConvexProvider>
  )
}
