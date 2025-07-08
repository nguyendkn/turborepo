import { createFileRoute } from '@tanstack/react-router';

import { ProtectedRoute } from '@/components/auth/protected-route';
import UserFormPage from '@/pages/users/form';

export const Route = createFileRoute('/users/create')({
  component: () => (
    <ProtectedRoute requiredPermissions={['users:create']}>
      <UserFormPage />
    </ProtectedRoute>
  ),
});
