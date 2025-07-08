/**
 * Application Store
 * Global state management for application-wide data using TanStack Store
 */

import { Store } from '@tanstack/react-store';

import type { Theme, Notification, ModalState } from '@/types';

/**
 * Application state interface
 */
interface AppState {
  // Theme and UI preferences
  theme: Theme;
  sidebarCollapsed: boolean;

  // Notifications
  notifications: Notification[];

  // Modal state
  modal: ModalState;

  // Loading states for global operations
  globalLoading: boolean;

  // Application metadata
  version: string;
  environment: string;

  // Feature flags
  features: Record<string, boolean>;

  // Cache timestamps for data freshness
  cacheTimestamps: Record<string, number>;
}

/**
 * Initial application state
 */
const initialAppState: AppState = {
  theme: 'system',
  sidebarCollapsed: false,
  notifications: [],
  modal: {
    isOpen: false,
  },
  globalLoading: false,
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  features: {},
  cacheTimestamps: {},
};

/**
 * Application store
 */
export const appStore = new Store(initialAppState);

/**
 * Application store actions
 */
export const appActions = {
  /**
   * Theme management
   */
  setTheme: (theme: Theme) => {
    appStore.setState(state => ({
      ...state,
      theme,
    }));

    // Persist theme preference
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Failed to save theme preference
    }
  },

  /**
   * Initialize theme from storage
   */
  initializeTheme: () => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        appActions.setTheme(savedTheme);
      }
    } catch {
      // Failed to load theme preference
    }
  },

  /**
   * Sidebar management
   */
  toggleSidebar: () => {
    appStore.setState(state => ({
      ...state,
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    appStore.setState(state => ({
      ...state,
      sidebarCollapsed: collapsed,
    }));
  },

  /**
   * Notification management
   */
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    appStore.setState(state => ({
      ...state,
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        appActions.removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id: string) => {
    appStore.setState(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    appStore.setState(state => ({
      ...state,
      notifications: [],
    }));
  },

  /**
   * Modal management
   */
  openModal: (modalState: Omit<ModalState, 'isOpen'>) => {
    appStore.setState(state => ({
      ...state,
      modal: {
        ...modalState,
        isOpen: true,
      },
    }));
  },

  closeModal: () => {
    const currentModal = appStore.state.modal;

    appStore.setState(state => ({
      ...state,
      modal: {
        isOpen: false,
      },
    }));

    // Call onClose callback if provided
    if (currentModal.onClose) {
      currentModal.onClose();
    }
  },

  /**
   * Global loading state
   */
  setGlobalLoading: (loading: boolean) => {
    appStore.setState(state => ({
      ...state,
      globalLoading: loading,
    }));
  },

  /**
   * Feature flags management
   */
  setFeature: (feature: string, enabled: boolean) => {
    appStore.setState(state => ({
      ...state,
      features: {
        ...state.features,
        [feature]: enabled,
      },
    }));
  },

  setFeatures: (features: Record<string, boolean>) => {
    appStore.setState(state => ({
      ...state,
      features: {
        ...state.features,
        ...features,
      },
    }));
  },

  /**
   * Cache timestamp management
   */
  setCacheTimestamp: (key: string, timestamp?: number) => {
    appStore.setState(state => ({
      ...state,
      cacheTimestamps: {
        ...state.cacheTimestamps,
        [key]: timestamp || Date.now(),
      },
    }));
  },

  getCacheAge: (key: string): number => {
    const timestamp = appStore.state.cacheTimestamps[key];
    return timestamp ? Date.now() - timestamp : Infinity;
  },

  isCacheStale: (key: string, maxAge: number = 5 * 60 * 1000): boolean => {
    return appActions.getCacheAge(key) > maxAge;
  },

  /**
   * Initialize application state
   */
  initialize: () => {
    appActions.initializeTheme();

    // Set application metadata
    appStore.setState(state => ({
      ...state,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE || 'development',
    }));
  },
};

/**
 * Application store selectors
 */
export const appSelectors = {
  /**
   * Get current application state
   */
  getState: () => appStore.state,

  /**
   * Get theme
   */
  getTheme: () => appStore.state.theme,

  /**
   * Get sidebar state
   */
  isSidebarCollapsed: () => appStore.state.sidebarCollapsed,

  /**
   * Get notifications
   */
  getNotifications: () => appStore.state.notifications,

  /**
   * Get modal state
   */
  getModal: () => appStore.state.modal,

  /**
   * Get global loading state
   */
  isGlobalLoading: () => appStore.state.globalLoading,

  /**
   * Check feature flag
   */
  isFeatureEnabled: (feature: string) =>
    appStore.state.features[feature] || false,

  /**
   * Get application metadata
   */
  getVersion: () => appStore.state.version,
  getEnvironment: () => appStore.state.environment,
};
