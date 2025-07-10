# Policies API

## Overview

The Policies API provides endpoints for managing authorization policies within the PBAC (Policy-Based Access Control) system. Policies define permissions and access rules for resources.

**Base Path**: `/api/v1/policies`

**Required Permissions**: All endpoints require appropriate permissions based on the operation.

## Endpoints

### GET /policies

Get all policies with pagination, filtering, and search capabilities.

**Required Permission**: `read:policies`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in policy name and description
- `isActive` (boolean): Filter by active status
- `type` (string): Filter by policy type
- `sort` (string): Sort field (default: 'createdAt')
- `order` (string): Sort order ('asc' or 'desc', default: 'desc')

**Example Request:**
```
GET /api/v1/policies?page=1&limit=20&search=user&isActive=true&type=resource&sort=name&order=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "policy-id-1",
        "name": "user-management",
        "description": "Policy for user management operations",
        "version": 1,
        "isActive": true,
        "type": "resource",
        "priority": 100,
        "roleCount": 2,
        "createdAt": "2025-07-01T09:00:00.000Z",
        "updatedAt": "2025-07-10T10:30:00.000Z",
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
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /policies/:id

Get a specific policy by ID with detailed information.

**Required Permission**: `read:policies`

**Parameters:**
- `id` (path): Policy ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "policy-id",
    "name": "user-management",
    "description": "Comprehensive policy for user management operations",
    "version": 1,
    "isActive": true,
    "type": "resource",
    "priority": 100,
    "roleCount": 2,
    "createdAt": "2025-07-01T09:00:00.000Z",
    "updatedAt": "2025-07-10T10:30:00.000Z",
    "permissions": [
      {
        "action": "create",
        "resource": "users",
        "conditions": {
          "department": "IT"
        }
      },
      {
        "action": "read",
        "resource": "users",
        "conditions": {}
      },
      {
        "action": "update",
        "resource": "users",
        "conditions": {
          "owner": true
        }
      }
    ],
    "roles": [
      {
        "id": "role-id-1",
        "name": "admin",
        "description": "Administrator role"
      },
      {
        "id": "role-id-2",
        "name": "hr-manager",
        "description": "HR Manager role"
      }
    ],
    "createdBy": {
      "id": "user-id",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User"
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: Policy not found

---

### POST /policies

Create a new policy.

**Required Permission**: `create:policies`

**Request Body:**
```json
{
  "name": "content-management",
  "description": "Policy for content management operations",
  "type": "resource",
  "isActive": true,
  "priority": 75,
  "permissions": [
    {
      "action": "create",
      "resource": "content",
      "conditions": {
        "department": "Marketing"
      }
    },
    {
      "action": "read",
      "resource": "content",
      "conditions": {}
    },
    {
      "action": "update",
      "resource": "content",
      "conditions": {
        "owner": true
      }
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-policy-id",
    "name": "content-management",
    "description": "Policy for content management operations",
    "version": 1,
    "isActive": true,
    "type": "resource",
    "priority": 75,
    "roleCount": 0,
    "createdAt": "2025-07-10T11:00:00.000Z",
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "permissions": [
      {
        "action": "create",
        "resource": "content",
        "conditions": {
          "department": "Marketing"
        }
      },
      {
        "action": "read",
        "resource": "content",
        "conditions": {}
      },
      {
        "action": "update",
        "resource": "content",
        "conditions": {
          "owner": true
        }
      }
    ],
    "createdBy": {
      "id": "current-user-id",
      "email": "admin@example.com"
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `409`: Policy name already exists
- `422`: Validation errors

---

### PUT /policies/:id

Update an existing policy.

**Required Permission**: `update:policies`

**Parameters:**
- `id` (path): Policy ID

**Request Body:**
```json
{
  "name": "advanced-content-management",
  "description": "Advanced policy for content management with extended permissions",
  "isActive": true,
  "priority": 85,
  "permissions": [
    {
      "action": "create",
      "resource": "content",
      "conditions": {}
    },
    {
      "action": "read",
      "resource": "content",
      "conditions": {}
    },
    {
      "action": "update",
      "resource": "content",
      "conditions": {}
    },
    {
      "action": "delete",
      "resource": "content",
      "conditions": {
        "owner": true
      }
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "policy-id",
    "name": "advanced-content-management",
    "description": "Advanced policy for content management with extended permissions",
    "version": 2,
    "isActive": true,
    "type": "resource",
    "priority": 85,
    "roleCount": 1,
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "permissions": [
      {
        "action": "create",
        "resource": "content",
        "conditions": {}
      },
      {
        "action": "read",
        "resource": "content",
        "conditions": {}
      },
      {
        "action": "update",
        "resource": "content",
        "conditions": {}
      },
      {
        "action": "delete",
        "resource": "content",
        "conditions": {
          "owner": true
        }
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `404`: Policy not found
- `409`: Policy name already exists (if name changed)
- `422`: Validation errors

---

### DELETE /policies/:id

Delete a policy (soft delete).

**Required Permission**: `delete:policies`

**Parameters:**
- `id` (path): Policy ID

**Response (200):**
```json
{
  "success": true,
  "message": "Policy deleted successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: Policy not found
- `409`: Cannot delete policy assigned to roles

---

### POST /policies/:id/toggle-status

Toggle policy active status.

**Required Permission**: `update:policies`

**Parameters:**
- `id` (path): Policy ID

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "policy-id",
    "isActive": false,
    "updatedAt": "2025-07-10T11:00:00.000Z"
  },
  "message": "Policy status updated successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /policies/:id/roles

Get all roles assigned to a specific policy.

**Required Permission**: `read:policies`

**Parameters:**
- `id` (path): Policy ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policy": {
      "id": "policy-id",
      "name": "user-management",
      "description": "User management policy"
    },
    "roles": [
      {
        "id": "role-id-1",
        "name": "admin",
        "description": "Administrator role",
        "isActive": true,
        "assignedAt": "2025-07-01T09:00:00.000Z"
      },
      {
        "id": "role-id-2",
        "name": "hr-manager",
        "description": "HR Manager role",
        "isActive": true,
        "assignedAt": "2025-07-05T14:30:00.000Z"
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### POST /policies/evaluate

Evaluate permissions for a specific user and resource.

**Required Permission**: `evaluate:policies`

**Request Body:**
```json
{
  "userId": "user-id",
  "action": "read",
  "resource": "users",
  "context": {
    "department": "IT",
    "location": "US"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "policies": [
      {
        "id": "policy-id-1",
        "name": "user-management",
        "matched": true,
        "conditions": {}
      }
    ],
    "context": {
      "userId": "user-id",
      "action": "read",
      "resource": "users",
      "evaluatedAt": "2025-07-10T11:00:00.000Z"
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

## Policy Object Schema

```json
{
  "id": "string (UUID)",
  "name": "string (unique, 1-100 chars)",
  "description": "string (max 500 chars) | null",
  "version": "number",
  "isActive": "boolean",
  "type": "string (resource|attribute|time)",
  "priority": "number (0-100)",
  "roleCount": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "permissions": [
    {
      "action": "string",
      "resource": "string",
      "conditions": "object"
    }
  ],
  "roles": [
    {
      "id": "string (UUID)",
      "name": "string",
      "description": "string",
      "isActive": "boolean",
      "assignedAt": "string (ISO date)"
    }
  ],
  "createdBy": {
    "id": "string (UUID)",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

## Permission Conditions

Conditions allow for fine-grained access control:

### Common Condition Types
- `owner`: User owns the resource
- `department`: User belongs to specific department
- `location`: User is in specific location
- `time`: Time-based restrictions
- `ip`: IP address restrictions

### Example Conditions
```json
{
  "owner": true,
  "department": ["IT", "HR"],
  "location": "US",
  "time": {
    "start": "09:00",
    "end": "17:00",
    "timezone": "UTC"
  },
  "ip": ["192.168.1.0/24"]
}
```

## Policy Types

| Type | Description |
|------|-------------|
| `resource` | Resource-based permissions |
| `attribute` | Attribute-based permissions |
| `time` | Time-based permissions |
| `location` | Location-based permissions |

## Validation Rules

### Create/Update Policy
- `name`: Required, unique, 1-100 characters
- `description`: Optional, max 500 characters
- `type`: Required, valid policy type
- `isActive`: Optional, boolean (default: true)
- `priority`: Optional, number 0-100 (default: 0)
- `permissions`: Required, array of permission objects

### Permission Object
- `action`: Required, valid action (create, read, update, delete, etc.)
- `resource`: Required, valid resource name
- `conditions`: Optional, object with condition rules

## Error Codes

| Code | Description |
|------|-------------|
| `POLICY_NOT_FOUND` | Policy with specified ID not found |
| `POLICY_NAME_EXISTS` | Policy name already exists |
| `POLICY_INVALID_PERMISSION` | Invalid permission configuration |
| `POLICY_ASSIGNED_TO_ROLES` | Cannot delete policy assigned to roles |
| `POLICY_INVALID_CONDITION` | Invalid condition in permission |
| `POLICY_EVALUATION_FAILED` | Policy evaluation failed |
