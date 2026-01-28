import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { TABLE_MISSION_REPORTS } from '~/db/constants'
import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions } from '~/lib/auth/permissions'

import { type FieldConfig, ResourceCard } from './resource-card'

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
  { key: 'classification', label: 'Class.', type: 'text' },
  { key: 'approved', label: 'Approved', type: 'boolean' },
]

export function MissionReportsCard({
  permissions,
}: {
  permissions: ResolvedPermissions | undefined
}) {
  const { activeUserId } = useActiveUser()

  const { data: entries } = useQuery({
    ...convexQuery(
      api.mission_reports.listMissionReports,
      activeUserId ? { callerUserId: activeUserId } : 'skip',
    ),
    enabled: !!activeUserId,
  })

  const { mutate: create } = useMutation({
    mutationFn: useConvexMutation(api.mission_reports.createMissionReport),
  })
  const { mutate: update } = useMutation({
    mutationFn: useConvexMutation(api.mission_reports.updateMissionReport),
  })
  const { mutate: remove } = useMutation({
    mutationFn: useConvexMutation(api.mission_reports.deleteMissionReport),
  })

  return (
    <ResourceCard
      resourceName={TABLE_MISSION_REPORTS}
      label="Mission Reports"
      entries={entries as any}
      fieldConfigs={FIELD_CONFIGS}
      permissions={permissions}
      onCreate={(data) =>
        create(
          {
            callerUserId: activeUserId!,
            title: String(data.title),
            author: String(data.author),
            classification: String(data.classification),
            approved: Boolean(data.approved),
          },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onUpdate={(id, fields) =>
        update(
          { callerUserId: activeUserId!, id: id as Id<'mission_reports'>, ...fields },
          { onError: (err) => toast.error(err.message) },
        )
      }
      onDelete={(id) =>
        remove(
          { callerUserId: activeUserId!, id: id as Id<'mission_reports'> },
          { onError: (err) => toast.error(err.message) },
        )
      }
    />
  )
}
