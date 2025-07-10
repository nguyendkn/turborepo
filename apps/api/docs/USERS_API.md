# Users API

## Overview

The Users API provides endpoints for user management, including CRUD operations, user activation/deactivation, and administrative functions.

**Base Path**: `/api/v1/users`

**Required Permissions**: All endpoints require appropriate permissions based on the operation.

## Endpoints

### GET /users

Get all users with pagination, filtering, and search capabilities.

**Required Permission**: `read:users`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and email
- `isActive` (boolean): Filter by active status
- `sort` (string): Sort field (default: 'createdAt')
- `order` (string): Sort order ('asc' or 'desc', default: 'desc')

**Example Request:**
```
GET /api/v1/users?page=1&limit=20&search=john&isActive=true&sort=email&order=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-id-1",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": true,
        "emailVerified": true,
        "lastLoginAt": "2025-07-10T10:30:00.000Z",
        "createdAt": "2025-07-01T09:00:00.000Z",
        "updatedAt": "2025-07-10T10:30:00.000Z",
        "roles": [
          {
            "id": "role-id",
            "name": "user",
            "description": "Standard user role"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /users/:id

Get a specific user by ID.

**Required Permission**: `read:users`

**Parameters:**
- `id` (path): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2025-07-10T10:30:00.000Z",
    "createdAt": "2025-07-01T09:00:00.000Z",
    "updatedAt": "2025-07-10T10:30:00.000Z",
    "profile": {
      "bio": "Software developer",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "+1234567890"
    },
    "roles": [
      {
        "id": "role-id",
        "name": "user",
        "description": "Standard user role",
        "permissions": ["read:profile", "update:profile"]
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: User not found

---

### POST /users

Create a new user.

**Required Permission**: `create:users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "roleIds": ["role-id-1", "role-id-2"],
  "isActive": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2025-07-10T11:00:00.000Z",
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "roles": [
      {
        "id": "role-id-1",
        "name": "user"
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `409`: Email already exists
- `422`: Validation errors

---

### PUT /users/:id

Update an existing user.

**Required Permission**: `update:users`

**Parameters:**
- `id` (path): User ID

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "roleIds": ["role-id-1"],
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "emailVerified": true,
    "updatedAt": "2025-07-10T11:00:00.000Z",
    "roles": [
      {
        "id": "role-id-1",
        "name": "user"
      }
    ]
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `404`: User not found
- `409`: Email already exists
- `422`: Validation errors

---

### DELETE /users/:id

Delete a user (soft delete).

**Required Permission**: `delete:users`

**Parameters:**
- `id` (path): User ID

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: User not found
- `409`: Cannot delete user with active sessions

---

### POST /users/:id/activate

Activate a user account.

**Required Permission**: `activate:users`

**Parameters:**
- `id` (path): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "isActive": true,
    "updatedAt": "2025-07-10T11:00:00.000Z"
  },
  "message": "User activated successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: User not found
- `409`: User already active

---

### POST /users/:id/deactivate

Deactivate a user account.

**Required Permission**: `deactivate:users`

**Parameters:**
- `id` (path): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "isActive": false,
    "updatedAt": "2025-07-10T11:00:00.000Z"
  },
  "message": "User deactivated successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: User not found
- `409`: User already inactive

---

### POST /users/:id/reset-password

Reset a user's password (admin function).

**Required Permission**: `reset-password:users`

**Parameters:**
- `id` (path): User ID

**Request Body:**
```json
{
  "newPassword": "newSecurePassword123",
  "sendEmail": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `404`: User not found
- `422`: Password validation errors

## User Object Schema

```json
{
  "id": "string (UUID)",
  "email": "string (email format)",
  "firstName": "string (1-50 chars)",
  "lastName": "string (1-50 chars)",
  "isActive": "boolean",
  "emailVerified": "boolean",
  "lastLoginAt": "string (ISO date) | null",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "profile": {
    "bio": "string | null",
    "avatar": "string (URL) | null",
    "phone": "string | null"
  },
  "roles": [
    {
      "id": "string (UUID)",
      "name": "string",
      "description": "string",
      "permissions": ["string"]
    }
  ]
}
```

## Validation Rules

### Create User
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, complexity rules
- `firstName`: Required, 1-50 characters
- `lastName`: Required, 1-50 characters
- `roleIds`: Optional, array of valid role IDs
- `isActive`: Optional, boolean (default: true)

### Update User
- `email`: Optional, valid email format, unique
- `firstName`: Optional, 1-50 characters
- `lastName`: Optional, 1-50 characters
- `roleIds`: Optional, array of valid role IDs
- `isActive`: Optional, boolean

## Error Codes

| Code | Description |
|------|-------------|
| `USER_NOT_FOUND` | User with specified ID not found |
| `USER_EMAIL_EXISTS` | Email address already in use |
| `USER_INVALID_ROLE` | One or more role IDs are invalid |
| `USER_CANNOT_DELETE_SELF` | Cannot delete your own account |
| `USER_ALREADY_ACTIVE` | User account is already active |
| `USER_ALREADY_INACTIVE` | User account is already inactive |
| `USER_HAS_ACTIVE_SESSIONS` | Cannot delete user with active sessions |
