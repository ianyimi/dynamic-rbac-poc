import { createFileRoute } from '@tanstack/react-router'
import { AccountView } from '@daveyplate/better-auth-ui'

export const Route = createFileRoute('/account/$accountView')({
  component: RouteComponent,
})

function RouteComponent() {
  const { accountView } = Route.useParams()
  return (
    <main>
      <AccountView pathname={accountView} />
    </main>
  )
}
