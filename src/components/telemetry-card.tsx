import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { TABLE_TELEMETRY_DATA } from '~/db/constants'
import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions } from '~/lib/auth/permissions'

import { type FieldConfig, ResourceCard } from './resource-card'

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'sensorName', label: 'Sensor', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
  { key: 'timestamp', label: 'Timestamp', type: 'number' },
  { key: 'status', label: 'Status', type: 'boolean' },
]

export function TelemetryCard({ permissions }: { permissions: ResolvedPermissions | undefined }) {
  const { activeUserId } = useActiveUser()

  const { data: entries } = useQuery({
    ...convexQuery(
      api.telemetry_data.listTelemetryData,
      activeUserId ? { callerUserId: activeUserId } : 'skip',
    ),
    enabled: !!activeUserId,
  })

  const { mutate: create } = useMutation({
    mutationFn: useConvexMutation(api.telemetry_data.createTelemetryData),
  })
  const { mutate: update } = useMutation({
    mutationFn: useConvexMutation(api.telemetry_data.updateTelemetryData),
  })
  const { mutate: remove } = useMutation({
    mutationFn: useConvexMutation(api.telemetry_data.deleteTelemetryData),
  })

  return (
    <ResourceCard
      resourceName={TABLE_TELEMETRY_DATA}
      label="Telemetry Data"
      entries={entries as any}
      fieldConfigs={FIELD_CONFIGS}
      permissions={permissions}
      onCreate={(data) =>
        create(
          {
            callerUserId: activeUserId!,
            sensorName: String(data.sensorName),
            value: Number(data.value),
            timestamp: Date.now(),
            status: Boolean(data.status),
          },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onUpdate={(id, fields) =>
        update(
          { callerUserId: activeUserId!, id: id as Id<'telemetry_data'>, ...fields },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onDelete={(id) =>
        remove(
          { callerUserId: activeUserId!, id: id as Id<'telemetry_data'> },
          { onError: (err) => toast.error(err.message) },
        )
      }
    />
  )
}
