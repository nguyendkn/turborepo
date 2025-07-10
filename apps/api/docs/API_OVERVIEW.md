# CSmart API Documentation

## Overview

CSmart API is a comprehensive enterprise-grade REST API built with HonoJS, providing authentication, user management, role-based access control (RBAC), and policy-based access control (PBAC) features.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.csmart.com`

## API Version

Current version: **v1**

All API endpoints are prefixed with `/api/v1/` or can be accessed directly under `/api/` for backward compatibility.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2025-07-10T11:00:00.000Z",
  "requestId": "unique-request-id"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2025-07-10T11:00:00.000Z",
  "requestId": "unique-request-id"
}
```

## HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists
- `422` - Unprocessable Entity: Validation error
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **File upload endpoints**: 5 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: 'createdAt')
- `order`: Sort order ('asc' or 'desc', default: 'desc')

Example:
```
GET /api/v1/users?page=2&limit=20&sort=email&order=asc
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

- `search`: Full-text search across relevant fields
- `filter[field]`: Filter by specific field values
- `isActive`: Filter by active status (true/false)

Example:
```
GET /api/v1/users?search=john&filter[isActive]=true
```

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- User login, registration, logout
- Password reset and email verification
- Token refresh

### Users (`/api/v1/users`)
- User management (CRUD operations)
- User activation/deactivation
- Password reset for users

### Profile (`/api/v1/profile`)
- Current user profile management
- Password change
- Avatar upload/delete
- Activity logs

### Roles (`/api/v1/roles`)
- Role management (CRUD operations)
- Role assignment to users
- Permission management for roles

### Policies (`/api/v1/policies`)
- Policy management (CRUD operations)
- Policy assignment to roles
- Policy evaluation

### Permissions (`/api/v1/permissions`)
- Permission management
- Permission checking
- Resource-based permissions

## Security Features

### Permission-Based Access Control (PBAC)

The API implements a sophisticated PBAC system where:

- **Users** have **Roles**
- **Roles** have **Policies**
- **Policies** define **Permissions** on **Resources**

### Middleware Protection

- **Authentication Middleware**: Validates JWT tokens
- **Permission Middleware**: Checks user permissions for resources
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin requests
- **Security Headers**: Adds security headers to responses

## Development Tools

### API Documentation
- **Swagger UI**: Available at `/docs`
- **OpenAPI Spec**: Available at `/docs/openapi.json`

### Health Check
- **Health Endpoint**: `/health`
- **Detailed Status**: Includes database connectivity and system info

## Error Handling

The API provides detailed error messages and proper HTTP status codes. Common error scenarios:

1. **Validation Errors**: Field-specific validation messages
2. **Authentication Errors**: Token expiry, invalid credentials
3. **Authorization Errors**: Insufficient permissions
4. **Resource Errors**: Not found, already exists
5. **Server Errors**: Database connectivity, internal errors

## SDK and Client Libraries

- **JavaScript/TypeScript**: Available via npm
- **React Hooks**: Pre-built hooks for common operations
- **API Client**: Auto-generated from OpenAPI spec

## Support

For API support and questions:
- **Documentation**: This documentation
- **Issues**: GitHub repository issues
- **Email**: support@csmart.com
