/**
 * Protected Route Component
 * Handles authentication checks and redirects for protected pages
 */

import { useLocation, useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import React, { useEffect } from 'react';

import { authSelectors, authStore } from '@/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
  showLoader?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallbackPath = '/auth/login',
  showLoader = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useStore(authStore, authSelectors.isAuthenticated);
  const isLoading = useStore(authStore, authSelectors.isLoading);
  const user = useStore(authStore, authSelectors.getUser);

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`;
      navigate({ to: redirectUrl });
      return;
    }

    // If authenticated but missing required permissions, redirect to unauthorized
    if (isAuthenticated && requiredPermissions.length > 0 && user) {
      // If user has no roles, skip permission check (might be loading)
      if (!user.roles || user.roles.length === 0) {
        return;
      }

      const hasPermissions = requiredPermissions.every(permission => {
        // Parse permission format: "action:resource" or just "role"
        if (permission.includes(':')) {
          const [action, resource] = permission.split(':');
          return user.roles?.some(role =>
            role.policies?.some(
              policy =>
                policy.isActive &&
                policy.effect === 'allow' &&
                (policy.actions?.includes(action) || policy.actions?.includes('*')) &&
                (policy.resources?.includes(resource) || policy.resources?.includes('*'))
            )
          );
        } else {
          // Treat as role name
          return user.roles?.some(role => role.name === permission);
        }
      });

      if (!hasPermissions) {
        navigate({ to: '/unauthorized' });
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requiredPermissions,
    navigate,
    location.pathname,
    fallbackPath,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    if (!showLoader) {
      return null;
    }

    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but missing permissions, don't render children
  if (requiredPermissions.length > 0 && user && user.roles) {
    const hasPermissions = requiredPermissions.every(permission => {
      // Parse permission format: "action:resource" or just "role"
      if (permission.includes(':')) {
        const [action, resource] = permission.split(':');
        return user.roles?.some(role =>
          role.policies?.some(
            policy =>
              policy.isActive &&
              policy.effect === 'allow' &&
              (policy.actions?.includes(action) || policy.actions?.includes('*')) &&
              (policy.resources?.includes(resource) || policy.resources?.includes('*'))
          )
        );
      } else {
        // Treat as role name
        return user.roles?.some(role => role.name === permission);
      }
    });

    if (!hasPermissions) {
      return null;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  const WrappedComponent: React.FC<P> = props => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Hook for checking authentication status and permissions
 */
export const useAuthGuard = (requiredPermissions: string[] = []) => {
  const isAuthenticated = useStore(authStore, authSelectors.isAuthenticated);
  const isLoading = useStore(authStore, authSelectors.isLoading);
  const user = useStore(authStore, authSelectors.getUser);

  const hasPermissions = React.useMemo(() => {
    if (!isAuthenticated || !user || !user.roles || requiredPermissions.length === 0) {
      return isAuthenticated;
    }

    return requiredPermissions.every(permission => {
      // Parse permission format: "action:resource" or just "role"
      if (permission.includes(':')) {
        const [action, resource] = permission.split(':');
        return user.roles?.some(role =>
          role.policies?.some(
            policy =>
              policy.isActive &&
              policy.effect === 'allow' &&
              (policy.actions?.includes(action) || policy.actions?.includes('*')) &&
              (policy.resources?.includes(resource) || policy.resources?.includes('*'))
          )
        );
      } else {
        // Treat as role name
        return user.roles?.some(role => role.name === permission);
      }
    });
  }, [isAuthenticated, user, requiredPermissions]);

  return {
    isAuthenticated,
    isLoading,
    hasPermissions,
    user,
    canAccess: isAuthenticated && hasPermissions,
  };
};

export default ProtectedRoute;
