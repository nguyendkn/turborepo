import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { useEffect } from 'react';

import { authStore, authSelectors } from '../store';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const isAuthenticated = useStore(authStore, authSelectors.isAuthenticated);
  const isLoading = useStore(authStore, authSelectors.isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate({ to: '/dashboard' });
      } else {
        navigate({ to: '/auth/login', search: { redirect: '' } });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while determining authentication status
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Loading...</p>
      </div>
    </div>
  );
}
