import { createFileRoute } from '@tanstack/react-router';

import ProtectedRoute from '../components/auth/protected-route';
import DashboardPage from '../pages/dashboard';

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});
