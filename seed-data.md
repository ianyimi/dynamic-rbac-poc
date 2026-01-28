# Seed Data for Convex Dashboard

Enter these in order: resources → roles → permissions → users → sample data.

Use the Convex dashboard at https://dashboard.convex.dev to add documents to each table.

---

## 1. `resources` table

```json
{ "name": "telemetry_data", "label": "telemetry data", "description": "real-time sensor telemetry readings", "isSystem": true },
{ "name": "mission_reports", "label": "Mission Reports", "description": "Mission documentation and status reports", "isSystem": true },
{ "name": "system_logs", "label": "System Logs", "description": "System event logs and diagnostics", "isSystem": true },
{ "name": "user_management", "label": "User Management", "description": "User accounts and access", "isSystem": true },
{ "name": "role_management", "label": "Role Management", "description": "Roles and permission configuration", "isSystem": true }
```

---

## 2. `roles` table

```json
{ "name": "Admin", "description": "Full system access", "isSystem": true },
{ "name": "Operator", "description": "Operational access to telemetry and logs", "isSystem": false },
{ "name": "Analyst", "description": "Read access with mission report editing", "isSystem": false },
{ "name": "Viewer", "description": "Read-only access to all resources", "isSystem": false }
```

---

## 3. `permissions` table

Replace `<ADMIN>`, `<OPERATOR>`, etc. with the `_id` values from the roles you just created.
Replace `<TELEMETRY>`, `<MISSIONS>`, etc. with the `_id` values from the resources you just created.

### Admin (full CRUD on everything)

```json
{ "roleId": "<ADMIN>", "resourceId": "<TELEMETRY>", "actions": ["create", "read", "update", "delete"] },
{ "roleId": "<ADMIN>", "resourceId": "<MISSIONS>", "actions": ["create", "read", "update", "delete"] },
{ "roleId": "<ADMIN>", "resourceId": "<SYSLOGS>", "actions": ["create", "read", "update", "delete"] },
{ "roleId": "<ADMIN>", "resourceId": "<USERMGMT>", "actions": ["create", "read", "update", "delete"] },
{ "roleId": "<ADMIN>", "resourceId": "<ROLEMGMT>", "actions": ["create", "read", "update", "delete"] }
```

### Operator

```json
{ "roleId": "<OPERATOR>", "resourceId": "<TELEMETRY>", "actions": ["read", "update"] },
{ "roleId": "<OPERATOR>", "resourceId": "<MISSIONS>", "actions": ["read"] },
{ "roleId": "<OPERATOR>", "resourceId": "<SYSLOGS>", "actions": ["read", "update"] }
```

### Analyst

```json
{ "roleId": "<ANALYST>", "resourceId": "<TELEMETRY>", "actions": ["read"] },
{ "roleId": "<ANALYST>", "resourceId": "<MISSIONS>", "actions": ["read", "update"] },
{ "roleId": "<ANALYST>", "resourceId": "<SYSLOGS>", "actions": ["read"] },
{ "roleId": "<ANALYST>", "resourceId": "<USERMGMT>", "actions": ["read"] },
{ "roleId": "<ANALYST>", "resourceId": "<ROLEMGMT>", "actions": ["read"] }
```

### Viewer (read-only on everything)

```json
{ "roleId": "<VIEWER>", "resourceId": "<TELEMETRY>", "actions": ["read"] },
{ "roleId": "<VIEWER>", "resourceId": "<MISSIONS>", "actions": ["read"] },
{ "roleId": "<VIEWER>", "resourceId": "<SYSLOGS>", "actions": ["read"] },
{ "roleId": "<VIEWER>", "resourceId": "<USERMGMT>", "actions": ["read"] },
{ "roleId": "<VIEWER>", "resourceId": "<ROLEMGMT>", "actions": ["read"] }
```

---

## 4. `users` table

Replace `<ADMIN>`, `<OPERATOR>`, etc. with the role `_id` values.

```json
{ "name": "Alice Chen", "email": "alice@example.com", "roleIds": ["<ADMIN>"], "isSuperAdmin": true },
{ "name": "Bob Martinez", "email": "bob@example.com", "roleIds": ["<OPERATOR>"] },
{ "name": "Carol Singh", "email": "carol@example.com", "roleIds": ["<ANALYST>"] },
{ "name": "Dave Kim", "email": "dave@example.com", "roleIds": ["<VIEWER>"] },
{ "name": "Eve Johnson", "email": "eve@example.com", "roleIds": [] },
{ "name": "Frank Reyes", "email": "frank@example.com", "roleIds": [] },
{ "name": "Grace Tanaka", "email": "grace@example.com", "roleIds": [] },
{ "name": "Hassan Ali", "email": "hassan@example.com", "roleIds": [] },
{ "name": "Iris Novak", "email": "iris@example.com", "roleIds": [] },
{ "name": "Jake Thompson", "email": "jake@example.com", "roleIds": [] }
```

---

## 5. `telemetry_data` table

```json
{ "sensorName": "Temperature Probe A", "value": 72.5, "timestamp": 1738099140000, "status": true },
{ "sensorName": "Pressure Sensor B", "value": 14.7, "timestamp": 1738099155000, "status": true },
{ "sensorName": "Humidity Monitor C", "value": 45.2, "timestamp": 1738099170000, "status": false },
{ "sensorName": "Radiation Detector D", "value": 0.03, "timestamp": 1738099185000, "status": true }
```

---

## 6. `mission_reports` table

```json
{ "title": "Orbital Survey Alpha", "author": "Dr. Sarah Park", "classification": "Confidential", "approved": true },
{ "title": "Debris Field Analysis", "author": "Cmdr. James Liu", "classification": "Secret", "approved": false },
{ "title": "Communication Relay Setup", "author": "Lt. Maria Gonzalez", "classification": "Unclassified", "approved": true }
```

---

## 7. `system_logs` table

```json
{ "level": "info", "message": "System startup complete", "timestamp": 1738099080000, "acknowledged": true },
{ "level": "warn", "message": "Memory usage at 85%", "timestamp": 1738099110000, "acknowledged": false },
{ "level": "error", "message": "Failed to connect to backup relay", "timestamp": 1738099140000, "acknowledged": false },
{ "level": "info", "message": "Telemetry sync successful", "timestamp": 1738099170000, "acknowledged": true }
```
