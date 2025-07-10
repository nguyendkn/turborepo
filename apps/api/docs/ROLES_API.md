# Roles API

## Overview

The Roles API provides endpoints for managing user roles, including CRUD operations, role assignments, and permission management within the RBAC (Role-Based Access Control) system.

**Base Path**: `/api/v1/roles`

**Required Permissions**: All endpoints require appropriate permissions based on the operation.

## Endpoints

### GET /roles

Get all roles with pagination, filtering, and search capabilities.

**Required Permission**: `read:roles`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in role name and description
- `isActive` (boolean): Filter by active status
- `isSystemRole` (boolean): Filter by system role status
- `sort` (string): Sort field (default: 'createdAt')
- `order` (string): Sort order ('asc' or 'desc', default: 'desc')

**Example Request:**
```
GET /api/v1/roles?page=1&limit=20&search=admin&isActive=true&sort=name&order=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "role-id-1",
        "name": "admin",
        "description": "Administrator role with full access",
        "isActive": true,
        "isSystemRole": true,
        "priority": 100,
        "userCount": 5,
        "createdAt": "2025-07-01T09:00:00.000Z",
        "updatedAt": "2025-07-10T10:30:00.000Z",
        "policies": [
          {
            "id": "policy-id-1",
            "name": "admin-policy",
            "description": "Full administrative access"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /roles/:id

Get a specific role by ID with detailed information.

**Required Permission**: `read:roles`

**Parameters:**
- `id` (path): Role ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "role-id",
    "name": "admin",
    "description": "Administrator role with full access",
    "isActive": true,
    "isSystemRole": true,
    "priority": 100,
    "userCount": 5,
    "createdAt": "2025-07-01T09:00:00.000Z",
    "updatedAt": "2025-07-10T10:30:00.000Z",
    "policies": [
      {
        "id": "policy-id-1",
        "name": "admin-policy",
        "description": "Full administrative access",
        "permissions": [
          {
            "action": "create",
            "resource": "users",
            "conditions": {}
          },
          {
            "action": "read",
            "resource": "users",
            "conditions": {}
          }
        ]
      }
    ],
    "users": [
      {
        "id": "user-id-1",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "isActive": true
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: Role not found

---

### POST /roles

Create a new role.

**Required Permission**: `create:roles`

**Request Body:**
```json
{
  "name": "manager",
  "description": "Manager role with limited administrative access",
  "isActive": true,
  "priority": 50,
  "policyIds": ["policy-id-1", "policy-id-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-role-id",
    "name": "manager",
    "description": "Manager role with limited administrative access",
    "isActive": true,
    "isSystemRole": false,
    "priority": 50,
    "userCount": 0,
    "createdAt": "2025-07-10T11:00:00.000Z",
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "policies": [
      {
        "id": "policy-id-1",
        "name": "user-management",
        "description": "User management permissions"
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `409`: Role name already exists
- `422`: Validation errors

---

### PUT /roles/:id

Update an existing role.

**Required Permission**: `update:roles`

**Parameters:**
- `id` (path): Role ID

**Request Body:**
```json
{
  "name": "senior-manager",
  "description": "Senior manager role with extended permissions",
  "isActive": true,
  "priority": 75,
  "policyIds": ["policy-id-1", "policy-id-2", "policy-id-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "role-id",
    "name": "senior-manager",
    "description": "Senior manager role with extended permissions",
    "isActive": true,
    "isSystemRole": false,
    "priority": 75,
    "userCount": 3,
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "policies": [
      {
        "id": "policy-id-1",
        "name": "user-management"
      },
      {
        "id": "policy-id-2",
        "name": "content-management"
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `404`: Role not found
- `409`: Role name already exists (if name changed)
- `422`: Validation errors

---

### DELETE /roles/:id

Delete a role (soft delete).

**Required Permission**: `delete:roles`

**Parameters:**
- `id` (path): Role ID

**Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: Role not found
- `409`: Cannot delete system role
- `409`: Cannot delete role with assigned users

---

### POST /roles/:id/assign

Assign a role to users.

**Required Permission**: `assign:roles`

**Parameters:**
- `id` (path): Role ID

**Request Body:**
```json
{
  "userIds": ["user-id-1", "user-id-2", "user-id-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roleId": "role-id",
    "assignedUsers": [
      {
        "id": "user-id-1",
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      {
        "id": "user-id-2",
        "email": "user2@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    ],
    "skippedUsers": [
      {
        "id": "user-id-3",
        "reason": "User already has this role"
      }
    ]
  },
  "message": "Role assigned to 2 users successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: Role not found
- `400`: Invalid user IDs

---

### POST /roles/:id/unassign

Remove a role from users.

**Required Permission**: `assign:roles`

**Parameters:**
- `id` (path): Role ID

**Request Body:**
```json
{
  "userIds": ["user-id-1", "user-id-2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roleId": "role-id",
    "unassignedUsers": [
      {
        "id": "user-id-1",
        "email": "user1@example.com"
      }
    ],
    "skippedUsers": [
      {
        "id": "user-id-2",
        "reason": "User doesn't have this role"
      }
    ]
  },
  "message": "Role removed from 1 user successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /roles/:id/users

Get all users assigned to a specific role.

**Required Permission**: `read:roles`

**Parameters:**
- `id` (path): Role ID

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search in user name and email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "role": {
      "id": "role-id",
      "name": "manager",
      "description": "Manager role"
    },
    "users": {
      "items": [
        {
          "id": "user-id-1",
          "email": "manager1@example.com",
          "firstName": "John",
          "lastName": "Manager",
          "isActive": true,
          "assignedAt": "2025-07-05T10:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 5,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
      }
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

## Role Object Schema

```json
{
  "id": "string (UUID)",
  "name": "string (unique, 1-50 chars)",
  "description": "string (max 200 chars) | null",
  "isActive": "boolean",
  "isSystemRole": "boolean",
  "priority": "number (0-100)",
  "userCount": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "policies": [
    {
      "id": "string (UUID)",
      "name": "string",
      "description": "string",
      "permissions": [
        {
          "action": "string",
          "resource": "string",
          "conditions": "object"
        }
      ]
    }
  ],
  "users": [
    {
      "id": "string (UUID)",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "isActive": "boolean",
      "assignedAt": "string (ISO date)"
    }
  ]
}
```

## Validation Rules

### Create Role
- `name`: Required, unique, 1-50 characters, alphanumeric and hyphens only
- `description`: Optional, max 200 characters
- `isActive`: Optional, boolean (default: true)
- `priority`: Optional, number 0-100 (default: 0)
- `policyIds`: Optional, array of valid policy IDs

### Update Role
- `name`: Optional, unique, 1-50 characters, alphanumeric and hyphens only
- `description`: Optional, max 200 characters
- `isActive`: Optional, boolean
- `priority`: Optional, number 0-100
- `policyIds`: Optional, array of valid policy IDs

### Role Assignment
- `userIds`: Required, array of valid user IDs (max 100 per request)

## System Roles

System roles are predefined roles that cannot be deleted:

- `super-admin`: Full system access
- `admin`: Administrative access
- `user`: Standard user access
- `guest`: Limited read-only access

## Error Codes

| Code | Description |
|------|-------------|
| `ROLE_NOT_FOUND` | Role with specified ID not found |
| `ROLE_NAME_EXISTS` | Role name already exists |
| `ROLE_INVALID_POLICY` | One or more policy IDs are invalid |
| `ROLE_CANNOT_DELETE_SYSTEM` | Cannot delete system role |
| `ROLE_HAS_ASSIGNED_USERS` | Cannot delete role with assigned users |
| `ROLE_INVALID_PRIORITY` | Priority must be between 0 and 100 |
| `ROLE_ASSIGNMENT_FAILED` | Role assignment operation failed |
