# CSmart API Documentation

This directory contains comprehensive documentation for the CSmart API - a modern, enterprise-grade REST API built with HonoJS, featuring authentication, user management, and advanced RBAC/PBAC systems.

## 📚 Documentation Overview

| Document | Description |
|----------|-------------|
| [API Overview](./API_OVERVIEW.md) | General API information, conventions, and getting started |
| [Authentication API](./AUTH_API.md) | Login, registration, password management, and token handling |
| [Users API](./USERS_API.md) | User management, CRUD operations, and administrative functions |
| [Profile API](./PROFILE_API.md) | User profile management, settings, and account operations |
| [Roles API](./ROLES_API.md) | Role-based access control (RBAC) management |
| [Policies API](./POLICIES_API.md) | Policy-based access control (PBAC) management |
| [Permissions API](./PERMISSIONS_API.md) | Permission checking and resource access control |

## 🚀 Quick Start

### Base Information
- **Development URL**: `http://localhost:3001`
- **Production URL**: `https://api.csmart.com`
- **API Version**: v1
- **Authentication**: JWT Bearer tokens
- **Interactive Docs**: Available at `/docs` (Swagger UI)

### Authentication Flow
```bash
# 1. Login to get tokens
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. Use access token for API calls
curl -X GET http://localhost:3001/api/v1/profile \
  -H "Authorization: Bearer <access-token>"
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure access and refresh token system
- **RBAC**: Role-based access control with hierarchical permissions
- **PBAC**: Policy-based access control with conditional permissions
- **Rate Limiting**: Protection against API abuse
- **Password Security**: Strong password requirements and hashing

### Permission System
```
Users → Roles → Policies → Permissions → Resources
```

## 📋 API Endpoints Summary

### 🔑 Authentication (`/api/v1/auth`)
```
POST   /auth/login              # User login
POST   /auth/register           # User registration  
POST   /auth/refresh            # Refresh access token
POST   /auth/logout             # User logout
POST   /auth/forgot-password    # Request password reset
POST   /auth/reset-password     # Reset password with token
GET    /auth/verify-email/:token # Verify email address
```

### 👥 Users Management (`/api/v1/users`)
```
GET    /users                   # List all users (paginated)
POST   /users                   # Create new user
GET    /users/:id               # Get specific user
PUT    /users/:id               # Update user
DELETE /users/:id               # Delete user (soft delete)
POST   /users/:id/activate      # Activate user account
POST   /users/:id/deactivate    # Deactivate user account
POST   /users/:id/reset-password # Admin password reset
```

### 👤 Profile Management (`/api/v1/profile`)
```
GET    /profile                 # Get current user profile
PUT    /profile                 # Update profile information
POST   /profile/change-password # Change password
POST   /profile/upload-avatar   # Upload avatar image
DELETE /profile/avatar          # Delete avatar
GET    /profile/activity        # Get activity log
POST   /profile/deactivate      # Deactivate own account
```

### 🛡️ Roles Management (`/api/v1/roles`)
```
GET    /roles                   # List all roles
POST   /roles                   # Create new role
GET    /roles/:id               # Get specific role
PUT    /roles/:id               # Update role
DELETE /roles/:id               # Delete role
POST   /roles/:id/assign        # Assign role to users
POST   /roles/:id/unassign      # Remove role from users
GET    /roles/:id/users         # Get users with specific role
```

### 📋 Policies Management (`/api/v1/policies`)
```
GET    /policies                # List all policies
POST   /policies                # Create new policy
GET    /policies/:id            # Get specific policy
PUT    /policies/:id            # Update policy
DELETE /policies/:id            # Delete policy
POST   /policies/:id/toggle-status # Toggle policy status
GET    /policies/:id/roles      # Get roles using policy
POST   /policies/evaluate       # Evaluate permissions
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message",
  "timestamp": "2025-07-10T11:00:00.000Z",
  "requestId": "unique-request-id"
}
```

### Error Response
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

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🔒 Authentication

### JWT Token Usage
```bash
# Include in Authorization header
Authorization: Bearer <access-token>

# Token structure
{
  "userId": "user-id",
  "email": "user@example.com",
  "roles": ["admin", "user"],
  "permissions": ["read:users", "create:users"],
  "iat": 1641024000,
  "exp": 1641027600
}
```

### Token Lifecycle
- **Access Token**: 1 hour (short-lived)
- **Refresh Token**: 7 days (long-lived)
- **Reset Token**: 15 minutes (password reset)
- **Verification Token**: 24 hours (email verification)

## 🚦 Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 1 minute |
| Authentication | 10 requests | 1 minute |
| File Upload | 5 requests | 1 minute |
| Password Reset | 2 requests | 1 minute |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## 🔍 Filtering & Search

### Query Parameters
```bash
# Pagination
?page=2&limit=20

# Sorting
?sort=email&order=asc

# Filtering
?isActive=true&filter[department]=IT

# Search
?search=john

# Combined
?page=1&limit=10&search=admin&isActive=true&sort=createdAt&order=desc
```

## 🛠️ Development Tools

### Interactive Documentation
- **Swagger UI**: `http://localhost:3001/docs`
- **OpenAPI Spec**: `http://localhost:3001/docs/openapi.json`

### Health Check
- **Health Endpoint**: `http://localhost:3001/health`
- **Status**: Database connectivity and system information

### Example Response
```json
{
  "status": "healthy",
  "timestamp": "2025-07-10T11:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

## 🆘 Support & Resources

### Getting Help
- **Documentation**: Read the detailed API documentation files
- **Interactive Docs**: Use Swagger UI at `/docs` for testing
- **Health Check**: Monitor API status at `/health`
- **Issues**: Report bugs on GitHub repository
- **Email**: Contact support@csmart.com

### SDK & Libraries
- **JavaScript/TypeScript**: Available via npm
- **React Hooks**: Pre-built hooks for common operations
- **API Client**: Auto-generated from OpenAPI specification

### Best Practices
1. **Always handle errors** properly in your client applications
2. **Use pagination** for list endpoints to avoid large responses
3. **Implement token refresh** logic for seamless user experience
4. **Respect rate limits** to avoid being blocked
5. **Use HTTPS** in production environments
6. **Validate permissions** before making API calls

---

**Last Updated**: July 10, 2025  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
