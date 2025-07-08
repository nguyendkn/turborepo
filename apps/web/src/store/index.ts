/**
 * Store Index
 * Centralized exports for all stores and their utilities
 */

// Authentication store
export { authStore, authActions, authSelectors } from './auth-store';

// Application store
export { appStore, appActions, appSelectors } from './app-store';

/**
 * Store initialization
 * Call this function to initialize all stores
 */
export const initializeStores = async () => {
  const { appActions } = await import('./app-store');
  const { authActions } = await import('./auth-store');

  // Initialize application store
  appActions.initialize();

  // Initialize authentication store
  await authActions.initialize();
};

/**
 * Store cleanup
 * Call this function to cleanup all stores
 */
export const cleanupStores = async () => {
  const { appActions } = await import('./app-store');
  const { authActions } = await import('./auth-store');

  // Logout user
  authActions.logout();

  // Clear notifications
  appActions.clearNotifications();

  // Close modal
  appActions.closeModal();
};

/**
 * Store utilities
 */
export const storeUtils = {
  /**
   * Reset all stores to initial state
   */
  resetAll: () => {
    cleanupStores();
    initializeStores();
  },

  /**
   * Get combined loading state from all stores
   */
  isAnyLoading: async () => {
    const { authSelectors } = await import('./auth-store');
    const { appSelectors } = await import('./app-store');
    return authSelectors.isLoading() || appSelectors.isGlobalLoading();
  },

  /**
   * Get all active errors from stores
   */
  getAllErrors: async () => {
    const { authSelectors } = await import('./auth-store');
    const errors: string[] = [];

    const authError = authSelectors.getError();
    if (authError) {
      errors.push(authError);
    }

    return errors;
  },

  /**
   * Subscribe to authentication changes
   */
  subscribeToAuth: async (callback: (isAuthenticated: boolean) => void) => {
    const { authStore, authSelectors } = await import('./auth-store');
    return authStore.subscribe(() => {
      callback(authSelectors.isAuthenticated());
    });
  },

  /**
   * Subscribe to theme changes
   */
  subscribeToTheme: async (callback: (theme: string) => void) => {
    const { appStore, appSelectors } = await import('./app-store');
    return appStore.subscribe(() => {
      callback(appSelectors.getTheme());
    });
  },
};
