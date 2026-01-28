import { createFileRoute } from '@tanstack/react-router'

import { MissionReportsCard } from '~/components/mission-reports-card'
import { RoleManager } from '~/components/role-manager'
import { SystemLogsCard } from '~/components/system-logs-card'
import { TelemetryCard } from '~/components/telemetry-card'
import { ThemeToggle } from '~/components/ui/theme-toggle'
import { UserManagementCard } from '~/components/user-management-card'
import { UserSwitcher } from '~/components/user-switcher'
import { useActiveUser } from '~/lib/auth/context'
import { usePermissions } from '~/lib/auth/permissions'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const { activeUserId } = useActiveUser()
  const { permissions } = usePermissions(activeUserId)

  return (
    <div className="fixed inset-0 grid grid-cols-[380px_1fr]">
      {/* Left Panel */}
      <div className="flex flex-col gap-6 overflow-y-auto border-r p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Dynamic RBAC POC</h1>
          <ThemeToggle />
        </div>
        <UserSwitcher />
        <RoleManager permissions={permissions} />
      </div>

      {/* Right Panel */}
      <div className="overflow-y-scroll p-2">
        <div
          className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", !activeUserId && "pointer-events-none opacity-50")}
        >
          <TelemetryCard permissions={permissions} />
          <MissionReportsCard permissions={permissions} />
          <SystemLogsCard permissions={permissions} />
          <UserManagementCard permissions={permissions} />
        </div>
      </div>
    </div >
  )
}
