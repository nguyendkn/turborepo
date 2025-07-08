import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useEffect } from 'react';

import { ErrorBoundary, NotificationContainer } from '../components/ui';
import { useUnhandledErrorListener, useNetworkStatus } from '../hooks/ui';
import { queryClient } from '../lib/query-client';
import { initializeStores } from '../store';

function RootComponent() {
  // Setup global error listeners
  const { setupErrorListeners } = useUnhandledErrorListener();

  // Monitor network status
  useNetworkStatus({
    showNotifications: true,
    pingInterval: 30000,
  });

  useEffect(() => {
    // Initialize stores when app starts
    initializeStores();

    // Setup global error listeners
    const cleanup = setupErrorListeners();

    return cleanup;
  }, [setupErrorListeners]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className='app'>
          <Outlet />
        </div>

        {/* Global UI Components */}
        <NotificationContainer />

        {/* Development Tools */}
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
