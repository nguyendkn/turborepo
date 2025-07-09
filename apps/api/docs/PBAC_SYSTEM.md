# Policy-Based Access Control (PBAC) System

## Overview

This document describes the Policy-Based Access Control (PBAC) system that replaces the traditional
Role-Based Access Control (RBAC) approach. PBAC provides more flexible, fine-grained permission
management through dynamic policies and roles.

## Key Concepts

### 1. Policies

Policies define what actions can be performed on what resources under specific conditions.

**Structure:**

- **Actions**: What operations can be performed (e.g., `read`, `write`, `delete`, `*`)
- **Resources**: What entities the actions apply to (e.g., `users`, `posts`, `*`)
- **Effect**: Whether to `allow` or `deny` access
- **Conditions**: Additional constraints (time, IP, user attributes, etc.)
- **Priority**: Higher priority policies are evaluated first

### 2. Roles

Roles are dynamic collections of policies that can be assigned to users.

**Features:**

- Dynamic creation and modification
- Policy-based composition
- System vs. custom roles
- Expiration support

### 3. Permission Evaluation

The system evaluates permissions by:

1. Collecting all policies from user's roles
2. Sorting by priority (highest first)
3. Applying deny-first logic
4. Checking conditions and constraints
5. Caching results for performance

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │   Middleware    │    │     Routes      │
│                 │    │                 │    │                 │
│ • Role CRUD     │    │ • Auth Check    │    │ • PBAC Routes   │
│ • Policy CRUD   │    │ • Permission    │    │ • User Routes   │
│ • Permission    │    │   Evaluation    │    │ • API Routes    │
│   Evaluation    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    Services Layer                                  │
│                                 │                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │ Policy Engine   │    │ Role Manager    │    │ Permission      │ │
│  │                 │    │                 │    │ Evaluator       │ │
│  │ • Evaluate      │    │ • Create Roles  │    │                 │ │
│  │   Policies      │    │ • Assign Roles  │    │ • Check Perms   │ │
│  │ • Match Actions │    │ • Manage Users  │    │ • Cache Results │ │
│  │ • Check Conds   │    │                 │    │ • Bulk Checks   │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│                                 │                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Policy Repository                            │   │
│  │                                                             │   │
│  │ • Store Policies    • Query Policies    • Validate Data    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    Database Layer                                  │
│                                 │                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  policies   │  │    roles    │  │ role_       │  │ user_roles  │ │
│  │             │  │             │  │ policies    │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              policy_evaluation_cache                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

1. **policies** - Store policy definitions
2. **roles** - Store role definitions
3. **role_policies** - Link roles to policies
4. **user_roles** - Assign roles to users
5. **policy_evaluation_cache** - Cache permission results

### Key Relationships

- Users can have multiple roles
- Roles can have multiple policies
- Policies define granular permissions
- Cache stores evaluation results

## API Endpoints

### Policy Management

```
GET    /v1/policies              # List policies
POST   /v1/policies              # Create policy
GET    /v1/policies/:id          # Get policy
PUT    /v1/policies/:id          # Update policy
DELETE /v1/policies/:id          # Delete policy
PATCH  /v1/policies/:id/status   # Toggle policy status
```

### Role Management

```
GET    /v1/roles                 # List roles
POST   /v1/roles                 # Create role
GET    /v1/roles/:id             # Get role
PUT    /v1/roles/:id             # Update role
DELETE /v1/roles/:id             # Delete role
POST   /v1/roles/:id/assign      # Assign role to user
DELETE /v1/roles/:id/assign/:userId # Remove role from user
```

### Permission Evaluation

```
POST   /v1/permissions/check           # Check single permission
POST   /v1/permissions/evaluate        # Detailed evaluation
POST   /v1/permissions/check-multiple  # Check multiple permissions
GET    /v1/permissions/my-permissions  # Get user permissions
DELETE /v1/permissions/cache           # Clear permission cache
```

## Usage Examples

### 1. Creating a Policy

```typescript
const policy = await policyRepositoryService.createPolicy({
  name: 'User Read Access',
  description: 'Allow reading user information',
  conditions: {
    environment: {
      timeRange: {
        start: '09:00',
        end: '17:00',
      },
    },
  },
  actions: ['read'],
  resources: ['users'],
  effect: 'allow',
  priority: 100,
});
```

### 2. Creating a Role

```typescript
const role = await roleManagerService.createRole({
  name: 'Content Manager',
  description: 'Can manage content and moderate users',
  policyIds: ['policy-1', 'policy-2', 'policy-3'],
  isSystemRole: false,
});
```

### 3. Checking Permissions

```typescript
// In middleware
const hasPermission = await permissionEvaluatorService.hasPermission(
  user,
  {
    action: 'delete',
    resource: 'posts',
    resourceId: 'post-123',
  },
  {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
  }
);
```

### 4. Using Middleware

```typescript
// Require specific permission
app.get('/users', requirePermission('read', 'users'), userController.getUsers);

// Allow self-access
app.get(
  '/users/:id',
  requirePermission('read', 'users', {
    allowSelfAccess: true,
    selfAccessUserIdParam: 'id',
  }),
  userController.getUserById
);

// Require any of multiple permissions
app.get(
  '/admin',
  requireAnyPermission([
    { action: 'admin', resource: 'system' },
    { action: 'manage', resource: 'users' },
  ]),
  adminController.dashboard
);
```

## Policy Conditions

### Time-based Conditions

```typescript
conditions: {
  environment: {
    timeRange: {
      start: '09:00',
      end: '17:00'
    }
  }
}
```

### IP-based Conditions

```typescript
conditions: {
  environment: {
    ipWhitelist: ['192.168.1.0/24', '10.0.0.100'],
    ipBlacklist: ['192.168.1.50']
  }
}
```

### Resource Attribute Conditions

```typescript
conditions: {
  resource: {
    attributes: {
      ownerId: '${user.id}',  // Template variable
      status: 'published'
    }
  }
}
```

### User Attribute Conditions

```typescript
conditions: {
  user: {
    attributes: {
      department: 'engineering',
      level: 'senior'
    }
  }
}
```

## Migration from RBAC

### 1. Run Migration Script

```bash
npm run migrate:pbac
```

### 2. Update Middleware Usage

Replace old RBAC middleware:

```typescript
// Old RBAC
requireRole(UserRole.ADMIN);
requirePermission('users:read');

// New PBAC
requirePermission('admin', 'system');
requirePermission('read', 'users');
```

### 3. Update Type Definitions

Remove static role enums and use dynamic roles:

```typescript
// Old
interface User {
  role: UserRole;
}

// New
interface User {
  roles: Role[];
}
```

## Performance Considerations

### Caching

- Permission results are cached for 15 minutes
- Cache keys include user, action, resource, and context
- Automatic cache invalidation on policy/role changes

### Optimization Tips

1. Use specific actions/resources instead of wildcards when possible
2. Set appropriate policy priorities
3. Monitor cache hit rates
4. Regular cache cleanup for expired entries

## Security Best Practices

1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Deny by Default**: No access unless explicitly allowed
3. **Regular Audits**: Review policies and role assignments
4. **Condition Validation**: Validate all condition inputs
5. **Logging**: Log all permission evaluations for audit trails

## Troubleshooting

### Common Issues

1. **Permission Denied Unexpectedly**
   - Check policy conditions (time, IP, etc.)
   - Verify role assignments
   - Check for conflicting deny policies

2. **Performance Issues**
   - Monitor cache hit rates
   - Optimize policy conditions
   - Consider policy priority ordering

3. **Migration Issues**
   - Verify old role mappings
   - Check policy creation errors
   - Validate user role assignments

### Debug Tools

Use the permission evaluation endpoint for debugging:

```typescript
POST /v1/permissions/evaluate
{
  "action": "read",
  "resource": "users",
  "resourceId": "user-123"
}
```

This returns detailed evaluation results including which policies matched and why access was granted
or denied.
