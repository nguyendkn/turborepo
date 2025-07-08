import { createFileRoute } from '@tanstack/react-router';

import { ProtectedRoute } from '@/components/auth/protected-route';
import UsersPage from '@/pages/users';

export const Route = createFileRoute('/users')({
  component: () => (
    <ProtectedRoute requiredPermissions={['users:read']}>
      <UsersPage />
    </ProtectedRoute>
  ),
});
