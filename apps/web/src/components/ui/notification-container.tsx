/**
 * Notification Container Component
 * Displays app-wide notifications with animations and interactions
 */

import { useStore } from '@tanstack/react-store';
import { useEffect, useState } from 'react';

import { useNotifications } from '@/hooks/ui/use-notifications';
import { appStore } from '@/store/app-store';
import type { Notification } from '@/types';

/**
 * Individual notification component
 */
const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const getNotificationStyles = () => {
    const baseStyles =
      'relative flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform';
    const visibilityStyles =
      isVisible && !isExiting
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0';

    switch (notification.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg
            className='w-5 h-5 text-green-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className='w-5 h-5 text-red-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className='w-5 h-5 text-yellow-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className='w-5 h-5 text-blue-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className='flex-shrink-0'>{getIcon()}</div>

      <div className='ml-3 flex-1'>
        <h4 className='text-sm font-medium'>{notification.title}</h4>
        {notification.message && (
          <p className='mt-1 text-sm opacity-90'>{notification.message}</p>
        )}

        {/* Progress bar for progress notifications */}
        {typeof notification.progress === 'number' && (
          <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${notification.progress}%` }}
            />
          </div>
        )}

        {/* Indeterminate progress bar */}
        {notification.indeterminate && (
          <div className='mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
            <div className='bg-blue-600 h-2 rounded-full animate-pulse' />
          </div>
        )}

        {/* Action buttons */}
        {notification.actions && notification.actions.length > 0 && (
          <div className='mt-3 flex space-x-2'>
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className='text-xs font-medium underline hover:no-underline focus:outline-none'
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='ml-4 flex-shrink-0'>
        <button
          onClick={handleClose}
          className='inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200'
        >
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Main notification container component
 */
export const NotificationContainer = () => {
  const notifications = useStore(appStore, state => state.notifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full'>
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
