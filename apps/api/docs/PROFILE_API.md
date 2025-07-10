# Profile API

## Overview

The Profile API provides endpoints for users to manage their own profile information, including personal details, password changes, avatar management, and account settings.

**Base Path**: `/api/v1/profile`

**Authentication**: All endpoints require a valid JWT token.

## Endpoints

### GET /profile

Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "emailVerified": true,
      "lastLoginAt": "2025-07-10T10:30:00.000Z",
      "createdAt": "2025-07-01T09:00:00.000Z",
      "updatedAt": "2025-07-10T10:30:00.000Z"
    },
    "profile": {
      "bio": "Software developer passionate about clean code",
      "avatar": "https://example.com/avatars/user-id.jpg",
      "phone": "+1234567890",
      "website": "https://johndoe.dev",
      "location": "San Francisco, CA",
      "timezone": "America/Los_Angeles",
      "language": "en",
      "notifications": {
        "email": true,
        "push": false,
        "sms": false
      }
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

---

### PUT /profile

Update the current user's profile information.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Senior software developer with 5+ years experience",
  "phone": "+1234567890",
  "website": "https://johndoe.dev",
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "language": "en",
  "notifications": {
    "email": true,
    "push": false,
    "sms": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "updatedAt": "2025-07-10T11:00:00.000Z"
    },
    "profile": {
      "bio": "Senior software developer with 5+ years experience",
      "phone": "+1234567890",
      "website": "https://johndoe.dev",
      "location": "San Francisco, CA",
      "timezone": "America/Los_Angeles",
      "language": "en",
      "notifications": {
        "email": true,
        "push": false,
        "sms": false
      }
    }
  },
  "message": "Profile updated successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid request data
- `422`: Validation errors

---

### POST /profile/change-password

Change the current user's password.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid current password
- `422`: Password validation errors

---

### POST /profile/upload-avatar

Upload a new avatar image for the current user.

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `avatar`: Image file (JPEG, PNG, WebP)
- `maxSize`: 5MB
- `dimensions`: Recommended 400x400px

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatar": "https://example.com/avatars/user-id.jpg",
    "thumbnails": {
      "small": "https://example.com/avatars/user-id-small.jpg",
      "medium": "https://example.com/avatars/user-id-medium.jpg",
      "large": "https://example.com/avatars/user-id-large.jpg"
    }
  },
  "message": "Avatar uploaded successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid file format or size
- `413`: File too large
- `422`: Image processing error

---

### DELETE /profile/avatar

Delete the current user's avatar.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### GET /profile/activity

Get the current user's activity log.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `type` (string): Filter by activity type
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "activity-id",
        "type": "login",
        "description": "User logged in",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "location": "San Francisco, CA",
        "createdAt": "2025-07-10T10:30:00.000Z"
      },
      {
        "id": "activity-id-2",
        "type": "profile_update",
        "description": "Profile information updated",
        "changes": ["firstName", "bio"],
        "ipAddress": "192.168.1.100",
        "createdAt": "2025-07-10T09:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

---

### POST /profile/deactivate

Deactivate the current user's account.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "password": "currentPassword123",
  "reason": "No longer need the account"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "timestamp": "2025-07-10T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid password
- `409`: Account already deactivated

## Profile Object Schema

```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string (email format)",
    "firstName": "string (1-50 chars)",
    "lastName": "string (1-50 chars)",
    "isActive": "boolean",
    "emailVerified": "boolean",
    "lastLoginAt": "string (ISO date) | null",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "profile": {
    "bio": "string (max 500 chars) | null",
    "avatar": "string (URL) | null",
    "phone": "string (phone format) | null",
    "website": "string (URL format) | null",
    "location": "string (max 100 chars) | null",
    "timezone": "string (timezone) | null",
    "language": "string (language code) | null",
    "notifications": {
      "email": "boolean",
      "push": "boolean",
      "sms": "boolean"
    }
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

### Update Profile
- `firstName`: Optional, 1-50 characters
- `lastName`: Optional, 1-50 characters
- `bio`: Optional, max 500 characters
- `phone`: Optional, valid phone format
- `website`: Optional, valid URL format
- `location`: Optional, max 100 characters
- `timezone`: Optional, valid timezone identifier
- `language`: Optional, valid language code (ISO 639-1)

### Change Password
- `currentPassword`: Required, must match current password
- `newPassword`: Required, minimum 8 characters, complexity rules
- `confirmPassword`: Required, must match newPassword

### Avatar Upload
- **File Types**: JPEG, PNG, WebP
- **Max Size**: 5MB
- **Recommended Dimensions**: 400x400px (square)
- **Auto-processing**: Generates thumbnails in multiple sizes

## Activity Types

| Type | Description |
|------|-------------|
| `login` | User logged in |
| `logout` | User logged out |
| `profile_update` | Profile information updated |
| `password_change` | Password changed |
| `avatar_upload` | Avatar uploaded |
| `avatar_delete` | Avatar deleted |
| `email_change` | Email address changed |
| `account_deactivate` | Account deactivated |
| `settings_update` | Account settings updated |

## Error Codes

| Code | Description |
|------|-------------|
| `PROFILE_INVALID_PASSWORD` | Current password is incorrect |
| `PROFILE_WEAK_PASSWORD` | New password doesn't meet requirements |
| `PROFILE_INVALID_FILE` | Invalid avatar file format |
| `PROFILE_FILE_TOO_LARGE` | Avatar file exceeds size limit |
| `PROFILE_UPLOAD_FAILED` | Avatar upload failed |
| `PROFILE_ALREADY_DEACTIVATED` | Account is already deactivated |
| `PROFILE_INVALID_TIMEZONE` | Invalid timezone identifier |
| `PROFILE_INVALID_LANGUAGE` | Invalid language code |
