import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { TABLE_SYSTEM_LOGS } from '~/db/constants'
import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions } from '~/lib/auth/permissions'

import { type FieldConfig, ResourceCard } from './resource-card'

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'level', label: 'Level', type: 'text' },
  { key: 'message', label: 'Message', type: 'text' },
  { key: 'timestamp', label: 'Timestamp', type: 'number' },
  { key: 'acknowledged', label: 'Ack', type: 'boolean' },
]

export function SystemLogsCard({ permissions }: { permissions: ResolvedPermissions | undefined }) {
  const { activeUserId } = useActiveUser()

  const { data: entries } = useQuery({
    ...convexQuery(
      api.system_logs.listSystemLogs,
      activeUserId ? { callerUserId: activeUserId } : 'skip',
    ),
    enabled: !!activeUserId,
  })

  const { mutate: create } = useMutation({
    mutationFn: useConvexMutation(api.system_logs.createSystemLog),
  })
  const { mutate: update } = useMutation({
    mutationFn: useConvexMutation(api.system_logs.updateSystemLog),
  })
  const { mutate: remove } = useMutation({
    mutationFn: useConvexMutation(api.system_logs.deleteSystemLog),
  })

  return (
    <ResourceCard
      resourceName={TABLE_SYSTEM_LOGS}
      label="System Logs"
      entries={entries as any}
      fieldConfigs={FIELD_CONFIGS}
      permissions={permissions}
      onCreate={(data) =>
        create(
          {
            callerUserId: activeUserId!,
            level: String(data.level),
            message: String(data.message),
            timestamp: Date.now(),
            acknowledged: Boolean(data.acknowledged),
          },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onUpdate={(id, fields) =>
        update(
          { callerUserId: activeUserId!, id: id as Id<'system_logs'>, ...fields },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onDelete={(id) =>
        remove(
          { callerUserId: activeUserId!, id: id as Id<'system_logs'> },
          { onError: (err) => toast.error(err.message) },
        )
      }
    />
  )
}
