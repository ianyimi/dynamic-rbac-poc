import { useCallback, useEffect, useRef, useState } from 'react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { type ResolvedPermissions, hasPermission } from '~/lib/auth/permissions'

import { Button } from './ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export type FieldConfig = {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean'
}

interface ResourceCardProps<T extends { _id: string }> {
  resourceName: string
  label: string
  entries: T[] | null | undefined
  fieldConfigs: FieldConfig[]
  permissions: ResolvedPermissions | undefined
  onCreate: (data: Record<string, unknown>) => void
  onUpdate: (id: string, fields: Record<string, unknown>) => void
  onDelete: (id: string) => void
}

function DebouncedInput({
  value: externalValue,
  onChange,
  disabled,
  type,
  className,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  type: 'text' | 'number'
  className?: string
}) {
  const [localValue, setLocalValue] = useState(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFocusedRef = useRef(false)

  // Sync from server when not focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const debouncedOnChange = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onChange(val)
      }, 500)
    },
    [onChange],
  )

  return (
    <Input
      type={type}
      className={className}
      value={localValue}
      onFocus={() => {
        isFocusedRef.current = true
      }}
      onBlur={() => {
        isFocusedRef.current = false
        // Flush any pending update immediately on blur
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        if (localValue !== externalValue) {
          onChange(localValue)
        }
      }}
      onChange={(e) => {
        setLocalValue(e.target.value)
        debouncedOnChange(e.target.value)
      }}
      disabled={disabled}
    />
  )
}

export function ResourceCard<T extends { _id: string }>({
  resourceName,
  label,
  entries,
  fieldConfigs,
  permissions,
  onCreate,
  onUpdate,
  onDelete,
}: ResourceCardProps<T>) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<Record<string, unknown>>({})

  const canCreate = hasPermission(permissions, resourceName, 'create')
  const canRead = hasPermission(permissions, resourceName, 'read')
  const canUpdate = hasPermission(permissions, resourceName, 'update')
  const canDelete = hasPermission(permissions, resourceName, 'delete')

  const handleAdd = () => {
    const data: Record<string, unknown> = {}
    for (const field of fieldConfigs) {
      if (field.type === 'number') {
        data[field.key] = Number(newEntry[field.key]) || 0
      } else if (field.type === 'boolean') {
        data[field.key] = !!newEntry[field.key]
      } else {
        data[field.key] = String(newEntry[field.key] ?? '')
      }
    }
    onCreate(data)
    setNewEntry({})
    setShowAddForm(false)
    if (!canRead) {
      toast.success('Entry created (you cannot see it due to permissions)')
    }
  }

  return (
    <Card size="sm" className="flex h-120 flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>{label}</CardTitle>
        <CardAction>
          <Button
            size="xs"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={!canCreate}
          >
            <Plus className="size-3" />
            Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {showAddForm && (
          <div className="mb-3 flex flex-col gap-2 rounded-md border p-2">
            {fieldConfigs.map((field) => (
              <div key={field.key} className="flex items-center gap-2">
                <label className="w-20 text-xs font-medium">{field.label}</label>
                {field.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={!!newEntry[field.key]}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, [field.key]: e.target.checked })
                    }
                  />
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="h-7 text-xs"
                    value={String(newEntry[field.key] ?? '')}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, [field.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button size="xs" onClick={handleAdd}>
                Save
              </Button>
              <Button size="xs" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {!canRead ? (
          <div className="grid place-items-center h-full py-8 text-center">
            <div className="flex flex-col gap-2 items-center">
              <Lock className="text-muted-foreground size-8" />
              <span className="text-muted-foreground text-sm">No access</span>
            </div>
          </div>
        ) : entries === null || entries === undefined ? (
          <div className="text-muted-foreground py-4 text-center text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">No entries</div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <div key={entry._id} className="flex items-start gap-2 rounded-md border p-2">
                <div className="flex flex-1 flex-col gap-1">
                  {fieldConfigs.map((field) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <label className="text-muted-foreground w-20 shrink-0 text-xs">
                        {field.label}
                      </label>
                      {field.type === 'boolean' ? (
                        <input
                          type="checkbox"
                          checked={!!(entry as Record<string, unknown>)[field.key]}
                          onChange={(e) =>
                            onUpdate(entry._id, { [field.key]: e.target.checked })
                          }
                          disabled={!canUpdate}
                        />
                      ) : (
                        <DebouncedInput
                          type={field.type === 'number' ? 'number' : 'text'}
                          className="h-6 text-xs"
                          value={String(
                            (entry as Record<string, unknown>)[field.key] ?? '',
                          )}
                          onChange={(val) =>
                            onUpdate(entry._id, {
                              [field.key]:
                                field.type === 'number' ? Number(val) : val,
                            })
                          }
                          disabled={!canUpdate}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => onDelete(entry._id)}
                  disabled={!canDelete}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
