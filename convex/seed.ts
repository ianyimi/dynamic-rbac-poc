import {
  TABLE_MISSION_REPORTS,
  TABLE_PERMISSIONS,
  TABLE_RESOURCES,
  TABLE_ROLES,
  TABLE_SYSTEM_LOGS,
  TABLE_TELEMETRY_DATA,
  TABLE_USERS,
} from '~/db/constants'

import { mutation } from './_generated/server'

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all tables for re-seed
    for (const u of await ctx.db.query(TABLE_USERS).collect()) await ctx.db.delete(u._id)
    for (const r of await ctx.db.query(TABLE_ROLES).collect()) await ctx.db.delete(r._id)
    for (const r of await ctx.db.query(TABLE_RESOURCES).collect()) await ctx.db.delete(r._id)
    for (const p of await ctx.db.query(TABLE_PERMISSIONS).collect()) await ctx.db.delete(p._id)
    for (const t of await ctx.db.query(TABLE_TELEMETRY_DATA).collect()) await ctx.db.delete(t._id)
    for (const m of await ctx.db.query(TABLE_MISSION_REPORTS).collect()) await ctx.db.delete(m._id)
    for (const s of await ctx.db.query(TABLE_SYSTEM_LOGS).collect()) await ctx.db.delete(s._id)

    // --- Resources ---
    const telemetryDataRes = await ctx.db.insert(TABLE_RESOURCES, {
      name: TABLE_TELEMETRY_DATA,
      label: 'Telemetry Data',
      description: 'Real-time sensor telemetry readings',
      isSystem: true,
    })
    const missionReportsRes = await ctx.db.insert(TABLE_RESOURCES, {
      name: TABLE_MISSION_REPORTS,
      label: 'Mission Reports',
      description: 'Mission documentation and status reports',
      isSystem: true,
    })
    const systemLogsRes = await ctx.db.insert(TABLE_RESOURCES, {
      name: TABLE_SYSTEM_LOGS,
      label: 'System Logs',
      description: 'System event logs and diagnostics',
      isSystem: true,
    })
    const userManagementRes = await ctx.db.insert(TABLE_RESOURCES, {
      name: 'user_management',
      label: 'User Management',
      description: 'User accounts and access',
      isSystem: true,
    })
    const roleManagementRes = await ctx.db.insert(TABLE_RESOURCES, {
      name: 'role_management',
      label: 'Role Management',
      description: 'Roles and permission configuration',
      isSystem: true,
    })

    const allResources = [
      telemetryDataRes,
      missionReportsRes,
      systemLogsRes,
      userManagementRes,
      roleManagementRes,
    ]
    const allActions = ['create', 'read', 'update', 'delete']

    // --- Roles ---
    const adminRole = await ctx.db.insert(TABLE_ROLES, {
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
    })
    const operatorRole = await ctx.db.insert(TABLE_ROLES, {
      name: 'Operator',
      description: 'Operational access to telemetry and logs',
      isSystem: false,
    })
    const analystRole = await ctx.db.insert(TABLE_ROLES, {
      name: 'Analyst',
      description: 'Read access with mission report editing',
      isSystem: false,
    })
    const viewerRole = await ctx.db.insert(TABLE_ROLES, {
      name: 'Viewer',
      description: 'Read-only access to all resources',
      isSystem: false,
    })

    // --- Permissions ---
    // Admin: Full CRUD on all resources
    for (const resId of allResources) {
      await ctx.db.insert(TABLE_PERMISSIONS, {
        roleId: adminRole,
        resourceId: resId,
        actions: allActions,
      })
    }

    // Operator: R+U on telemetry_data, R on mission_reports, R+U on system_logs
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: operatorRole,
      resourceId: telemetryDataRes,
      actions: ['read', 'update'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: operatorRole,
      resourceId: missionReportsRes,
      actions: ['read'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: operatorRole,
      resourceId: systemLogsRes,
      actions: ['read', 'update'],
    })

    // Analyst: R on all 5, U on mission_reports
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: analystRole,
      resourceId: telemetryDataRes,
      actions: ['read'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: analystRole,
      resourceId: missionReportsRes,
      actions: ['read', 'update'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: analystRole,
      resourceId: systemLogsRes,
      actions: ['read'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: analystRole,
      resourceId: userManagementRes,
      actions: ['read'],
    })
    await ctx.db.insert(TABLE_PERMISSIONS, {
      roleId: analystRole,
      resourceId: roleManagementRes,
      actions: ['read'],
    })

    // Viewer: R on all 5
    for (const resId of allResources) {
      await ctx.db.insert(TABLE_PERMISSIONS, {
        roleId: viewerRole,
        resourceId: resId,
        actions: ['read'],
      })
    }

    // --- Users ---
    await ctx.db.insert(TABLE_USERS, {
      name: 'Alice Chen',
      email: 'alice@example.com',
      roleIds: [adminRole],
      isSuperAdmin: true,
    })
    await ctx.db.insert(TABLE_USERS, {
      name: 'Bob Martinez',
      email: 'bob@example.com',
      roleIds: [operatorRole],
    })
    await ctx.db.insert(TABLE_USERS, {
      name: 'Carol Singh',
      email: 'carol@example.com',
      roleIds: [analystRole],
    })
    await ctx.db.insert(TABLE_USERS, {
      name: 'Dave Kim',
      email: 'dave@example.com',
      roleIds: [viewerRole],
    })
    await ctx.db.insert(TABLE_USERS, {
      name: 'Eve Johnson',
      email: 'eve@example.com',
      roleIds: [],
    })

    // --- Sample Telemetry Data ---
    const now = Date.now()
    await ctx.db.insert(TABLE_TELEMETRY_DATA, {
      timestamp: now - 60000,
      sensorName: 'Temperature Probe A',
      value: 72.5,
      status: true,
    })
    await ctx.db.insert(TABLE_TELEMETRY_DATA, {
      timestamp: now - 45000,
      sensorName: 'Pressure Sensor B',
      value: 14.7,
      status: true,
    })
    await ctx.db.insert(TABLE_TELEMETRY_DATA, {
      timestamp: now - 30000,
      sensorName: 'Humidity Monitor C',
      value: 45.2,
      status: false,
    })
    await ctx.db.insert(TABLE_TELEMETRY_DATA, {
      timestamp: now - 15000,
      sensorName: 'Radiation Detector D',
      value: 0.03,
      status: true,
    })

    // --- Sample Mission Reports ---
    await ctx.db.insert(TABLE_MISSION_REPORTS, {
      title: 'Orbital Survey Alpha',
      author: 'Dr. Sarah Park',
      classification: 'Confidential',
      approved: true,
    })
    await ctx.db.insert(TABLE_MISSION_REPORTS, {
      title: 'Debris Field Analysis',
      author: 'Cmdr. James Liu',
      classification: 'Secret',
      approved: false,
    })
    await ctx.db.insert(TABLE_MISSION_REPORTS, {
      title: 'Communication Relay Setup',
      author: 'Lt. Maria Gonzalez',
      classification: 'Unclassified',
      approved: true,
    })

    // --- Sample System Logs ---
    await ctx.db.insert(TABLE_SYSTEM_LOGS, {
      timestamp: now - 120000,
      level: 'info',
      message: 'System startup complete',
      acknowledged: true,
    })
    await ctx.db.insert(TABLE_SYSTEM_LOGS, {
      timestamp: now - 90000,
      level: 'warn',
      message: 'Memory usage at 85%',
      acknowledged: false,
    })
    await ctx.db.insert(TABLE_SYSTEM_LOGS, {
      timestamp: now - 60000,
      level: 'error',
      message: 'Failed to connect to backup relay',
      acknowledged: false,
    })
    await ctx.db.insert(TABLE_SYSTEM_LOGS, {
      timestamp: now - 30000,
      level: 'info',
      message: 'Telemetry sync successful',
      acknowledged: true,
    })
  },
})
