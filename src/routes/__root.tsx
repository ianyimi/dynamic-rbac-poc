import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import type { ConvexQueryClient } from "@convex-dev/react-query"
import { Providers } from "~/providers"
import { ThemeProvider, getThemeServerFn } from "~/lib/theme"

import appCss from '../styles.css?url'
import { createServerFn } from "@tanstack/react-start"
import { getToken } from "~/lib/auth/server"

const getAuth = createServerFn().handler(async () => {
  return await getToken()
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient,
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    const token = await getAuth()
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }
    return {
      isAuthenticated: !!token,
      token
    }
  },
  loader: () => getThemeServerFn(),

  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent
})

function RootComponent() {
  return <Outlet />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  return (
    <p>Not Found</p>
  )
}
