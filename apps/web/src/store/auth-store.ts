/**
 * Authentication Store
 * Global state management for authentication using TanStack Store
 */

import { Store } from '@tanstack/react-store';

import { apiClient } from '@/lib/api-client';
import type { AuthState, User } from '@/types';

/**
 * Initial authentication state
 */
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

/**
 * Authentication store
 */
export const authStore = new Store(initialAuthState);

/**
 * Authentication store actions
 */
export const authActions = {
  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    authStore.setState(state => ({
      ...state,
      isLoading,
      error: isLoading ? null : state.error,
    }));
  },

  /**
   * Set error state
   */
  setError: (error: string | null) => {
    authStore.setState(state => ({
      ...state,
      error,
      isLoading: false,
    }));
  },

  /**
   * Set authentication success
   */
  setAuthenticated: (user: User, accessToken: string, refreshToken: string) => {
    // Update API client tokens
    apiClient.setTokens(accessToken, refreshToken);

    // Update store state
    authStore.setState({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Update user data
   */
  updateUser: (user: Partial<User>) => {
    authStore.setState(state => ({
      ...state,
      user: state.user ? { ...state.user, ...user } : null,
    }));
  },

  /**
   * Clear authentication
   */
  logout: () => {
    // Clear API client tokens
    apiClient.clearAuth();

    // Reset store state
    authStore.setState(initialAuthState);

    // Emit logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  /**
   * Initialize authentication from stored tokens
   */
  initialize: async () => {
    authActions.setLoading(true);

    try {
      // Check if API client has tokens
      if (!apiClient.isAuthenticated()) {
        authActions.setLoading(false);
        return;
      }

      // Try to fetch current user to validate token
      const response = await apiClient.get('/profile');

      if (response.success && response.data) {
        const user = response.data as User;
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          authActions.setAuthenticated(user, accessToken, refreshToken);
        } else {
          authActions.logout();
        }
      } else {
        authActions.logout();
      }
    } catch {
      // Failed to initialize auth
      authActions.logout();
    }
  },

  /**
   * Check if user has permission
   */
  hasPermission: (action: string, resource: string): boolean => {
    const state = authStore.state;

    if (!state.isAuthenticated || !state.user) {
      return false;
    }

    // Check user roles and their policies
    return state.user.roles.some(role =>
      role.policies?.some(
        policy =>
          policy.isActive &&
          policy.effect === 'allow' &&
          policy.actions.includes(action) &&
          policy.resources.includes(resource)
      )
    );
  },

  /**
   * Check if user has any of the specified roles
   */
  hasRole: (...roleNames: string[]): boolean => {
    const state = authStore.state;

    if (!state.isAuthenticated || !state.user) {
      return false;
    }

    const userRoleNames = state.user.roles.map(role => role.name);
    return roleNames.some(roleName => userRoleNames.includes(roleName));
  },

  /**
   * Get user's role names
   */
  getUserRoles: (): string[] => {
    const state = authStore.state;

    if (!state.isAuthenticated || !state.user) {
      return [];
    }

    return state.user.roles.map(role => role.name);
  },
};

/**
 * Authentication store selectors
 */
export const authSelectors = {
  /**
   * Get current authentication state
   */
  getState: () => authStore.state,

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => authStore.state.isAuthenticated,

  /**
   * Get current user
   */
  getUser: () => authStore.state.user,

  /**
   * Get loading state
   */
  isLoading: () => authStore.state.isLoading,

  /**
   * Get error state
   */
  getError: () => authStore.state.error,

  /**
   * Get access token
   */
  getAccessToken: () => authStore.state.accessToken,
};
