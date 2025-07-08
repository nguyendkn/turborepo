/**
 * Network Status Hook
 * Monitors network connectivity and provides offline/online status
 */

import { useState, useEffect, useCallback } from 'react';

import { useNotifications } from './use-notifications';

/**
 * Network Connection API interface
 */
interface NetworkConnection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

/**
 * Network status interface
 */
export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
}

/**
 * Network status hook options
 */
export interface NetworkStatusOptions {
  showNotifications?: boolean;
  pingUrl?: string;
  pingInterval?: number;
  pingTimeout?: number;
}

/**
 * Network status hook
 */
export const useNetworkStatus = (options: NetworkStatusOptions = {}) => {
  const {
    showNotifications = true,
    pingUrl = '/api/health',
    pingInterval = 30000, // 30 seconds
    pingTimeout = 5000, // 5 seconds
  } = options;

  const { addNotification, removeNotification } = useNotifications();

  // Basic online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionInfo, setConnectionInfo] = useState<
    Omit<NetworkStatus, 'isOnline' | 'isOffline'>
  >({
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: null,
  });

  // Enhanced status tracking
  const [isConnectedToServer, setIsConnectedToServer] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  // Notification IDs for managing persistent notifications
  const [offlineNotificationId, setOfflineNotificationId] = useState<
    string | null
  >(null);
  const [reconnectedNotificationId, setReconnectedNotificationId] = useState<
    string | null
  >(null);

  /**
   * Get connection information from Network Information API
   */
  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as { connection: NetworkConnection }).connection;
      setConnectionInfo({
        connectionType: connection.type || null,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
        saveData: connection.saveData || null,
      });
    }
  }, []);

  /**
   * Ping server to check actual connectivity
   */
  const pingServer = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setLastPingTime(new Date());
        setPingError(null);
        return true;
      } else {
        setPingError(`Server responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setPingError(errorMessage);
      return false;
    }
  }, [pingUrl, pingTimeout]);

  /**
   * Handle online status change
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    updateConnectionInfo();

    if (showNotifications) {
      // Remove offline notification
      if (offlineNotificationId) {
        removeNotification(offlineNotificationId);
        setOfflineNotificationId(null);
      }

      // Show reconnected notification
      const notificationId = addNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Your internet connection has been restored.',
        duration: 3000,
      });
      setReconnectedNotificationId(notificationId);
    }

    // Ping server to verify actual connectivity
    pingServer().then(setIsConnectedToServer);
  }, [
    showNotifications,
    offlineNotificationId,
    removeNotification,
    addNotification,
    updateConnectionInfo,
    pingServer,
  ]);

  /**
   * Handle offline status change
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setIsConnectedToServer(false);
    updateConnectionInfo();

    if (showNotifications) {
      // Remove reconnected notification
      if (reconnectedNotificationId) {
        removeNotification(reconnectedNotificationId);
        setReconnectedNotificationId(null);
      }

      // Show offline notification (persistent)
      const notificationId = addNotification({
        type: 'warning',
        title: 'No Internet Connection',
        message:
          'You are currently offline. Some features may not be available.',
        duration: 0, // Persistent
      });
      setOfflineNotificationId(notificationId);
    }
  }, [
    showNotifications,
    reconnectedNotificationId,
    removeNotification,
    addNotification,
    updateConnectionInfo,
  ]);

  /**
   * Handle connection change
   */
  const handleConnectionChange = useCallback(() => {
    updateConnectionInfo();
  }, [updateConnectionInfo]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Basic online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API events
    if ('connection' in navigator) {
      const connection = (navigator as { connection: NetworkConnection }).connection;
      connection.addEventListener('change', handleConnectionChange);
    }

    // Initial connection info
    updateConnectionInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator) {
        const connection = (navigator as { connection: NetworkConnection }).connection;
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [
    handleOnline,
    handleOffline,
    handleConnectionChange,
    updateConnectionInfo,
  ]);

  /**
   * Setup periodic server ping
   */
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const interval = setInterval(async () => {
      const serverReachable = await pingServer();
      setIsConnectedToServer(serverReachable);

      if (!serverReachable && showNotifications && !offlineNotificationId) {
        const notificationId = addNotification({
          type: 'warning',
          title: 'Server Connection Lost',
          message: 'Unable to reach the server. Please check your connection.',
          duration: 0,
        });
        setOfflineNotificationId(notificationId);
      } else if (serverReachable && offlineNotificationId) {
        removeNotification(offlineNotificationId);
        setOfflineNotificationId(null);
      }
    }, pingInterval);

    // Initial ping
    pingServer().then(setIsConnectedToServer);

    return () => clearInterval(interval);
  }, [
    isOnline,
    pingServer,
    pingInterval,
    showNotifications,
    offlineNotificationId,
    addNotification,
    removeNotification,
  ]);

  /**
   * Manual connectivity check
   */
  const checkConnectivity = useCallback(async () => {
    const serverReachable = await pingServer();
    setIsConnectedToServer(serverReachable);
    return {
      isOnline: navigator.onLine,
      isConnectedToServer: serverReachable,
    };
  }, [pingServer]);

  /**
   * Get connection quality description
   */
  const getConnectionQuality = useCallback(():
    | 'excellent'
    | 'good'
    | 'fair'
    | 'poor'
    | 'unknown' => {
    if (!isOnline || !isConnectedToServer) {
      return 'poor';
    }

    if (connectionInfo.effectiveType) {
      switch (connectionInfo.effectiveType) {
        case '4g':
          return 'excellent';
        case '3g':
          return 'good';
        case '2g':
          return 'fair';
        case 'slow-2g':
          return 'poor';
        default:
          return 'unknown';
      }
    }

    if (connectionInfo.downlink !== null) {
      if (connectionInfo.downlink >= 10) return 'excellent';
      if (connectionInfo.downlink >= 1.5) return 'good';
      if (connectionInfo.downlink >= 0.5) return 'fair';
      return 'poor';
    }

    return 'unknown';
  }, [isOnline, isConnectedToServer, connectionInfo]);

  /**
   * Check if connection is slow
   */
  const isSlowConnection = useCallback((): boolean => {
    if (connectionInfo.saveData) return true;
    if (
      connectionInfo.effectiveType === '2g' ||
      connectionInfo.effectiveType === 'slow-2g'
    )
      return true;
    if (connectionInfo.downlink !== null && connectionInfo.downlink < 1)
      return true;
    return false;
  }, [connectionInfo]);

  const networkStatus: NetworkStatus = {
    isOnline,
    isOffline: !isOnline,
    ...connectionInfo,
  };

  return {
    // Basic status
    ...networkStatus,

    // Enhanced status
    isConnectedToServer,
    lastPingTime,
    pingError,

    // Connection quality
    connectionQuality: getConnectionQuality(),
    isSlowConnection: isSlowConnection(),

    // Actions
    checkConnectivity,
    pingServer,
  };
};

/**
 * Simple network status hook for basic online/offline detection
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
