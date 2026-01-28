import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@convex/_generated/api'
import { type Id } from '@convex/_generated/dataModel'

import { useActiveUser } from '~/lib/auth/context'
import { type ResolvedPermissions, hasPermission } from '~/lib/auth/permissions'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

const ACTIONS = ['create', 'read', 'update', 'delete'] as const

interface RoleFormData {
  name: string
  description: string
  permissions: Record<string, string[]>
}

function RoleForm({
  resources,
  initial,
  onSubmit,
  onCancel,
}: {
  resources: { _id: Id<'resources'>; name: string; label: string }[]
  initial?: RoleFormData
  onSubmit: (data: RoleFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [perms, setPerms] = useState<Record<string, string[]>>(initial?.permissions ?? {})

  const toggleAction = (resourceName: string, action: string) => {
    setPerms((prev) => {
      const current = prev[resourceName] ?? []
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action]
      return { ...prev, [resourceName]: next }
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <Input placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left font-medium">Resource</th>
              {ACTIONS.map((a) => (
                <th key={a} className="px-1 text-center font-medium uppercase">
                  {a[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res._id}>
                <td className="py-1">{res.label}</td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-1 text-center">
                    <input
                      type="checkbox"
                      checked={(perms[res.name] ?? []).includes(action)}
                      onChange={() => toggleAction(res.name, action)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSubmit({ name, description, permissions: perms })}
          disabled={!name.trim()}
        >
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function RoleManager({ permissions }: { permissions: ResolvedPermissions | undefined }) {
  const { activeUserId } = useActiveUser()
  const { data: roles } = useQuery(convexQuery(api.roles.listRoles, {}))
  const { data: resources } = useQuery(convexQuery(api.permissions.listResources, {}))
  const [editingRoleId, setEditingRoleId] = useState<Id<'roles'> | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { mutate: createRole } = useMutation({
    mutationFn: useConvexMutation(api.roles.createRole),
  })
  const { mutate: updateRole } = useMutation({
    mutationFn: useConvexMutation(api.roles.updateRole),
  })
  const { mutate: deleteRole } = useMutation({
    mutationFn: useConvexMutation(api.roles.deleteRole),
  })

  const canCreate = hasPermission(permissions, 'role_management', 'create')
  const canUpdate = hasPermission(permissions, 'role_management', 'update')
  const canDelete = hasPermission(permissions, 'role_management', 'delete')

  if (!roles || !resources) return null

  const handleCreate = (data: RoleFormData) => {
    if (!activeUserId) return
    createRole(
      {
        callerUserId: activeUserId,
        name: data.name,
        description: data.description,
        permissions: resources.map((r) => ({
          resourceId: r._id,
          actions: data.permissions[r.name] ?? [],
        })),
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          toast.success('Role created')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const handleUpdate = (roleId: Id<'roles'>, data: RoleFormData) => {
    if (!activeUserId) return
    updateRole(
      {
        callerUserId: activeUserId,
        roleId,
        name: data.name,
        description: data.description,
        permissions: resources.map((r) => ({
          resourceId: r._id,
          actions: data.permissions[r.name] ?? [],
        })),
      },
      {
        onSuccess: () => {
          setEditingRoleId(null)
          toast.success('Role updated')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const handleDelete = (roleId: Id<'roles'>) => {
    if (!activeUserId) return
    deleteRole(
      { callerUserId: activeUserId, roleId },
      {
        onSuccess: () => toast.success('Role deleted'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Role Management
          <Button
            size="xs"
            onClick={() => setShowCreate(true)}
            disabled={!canCreate || showCreate}
          >
            <Plus className="size-3" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 overflow-y-scroll">
        {showCreate && (
          <RoleForm
            resources={resources}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        )}
        {roles.map((role) =>
          editingRoleId === role._id ? (
            <RoleForm
              key={role._id}
              resources={resources}
              initial={{
                name: role.name,
                description: role.description,
                permissions: role.permissions.reduce(
                  (acc, p) => {
                    acc[p.resourceName] = p.actions
                    return acc
                  },
                  {} as Record<string, string[]>,
                ),
              }}
              onSubmit={(data) => handleUpdate(role._id, data)}
              onCancel={() => setEditingRoleId(null)}
            />
          ) : (
            <div
              key={role._id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{role.name}</span>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-[10px]">
                      System
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">{role.description}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setEditingRoleId(role._id)}
                  disabled={!canUpdate || role.isSystem}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => handleDelete(role._id)}
                  disabled={!canDelete || role.isSystem}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ),
        )}
      </CardContent>
    </Card>
  )
}
