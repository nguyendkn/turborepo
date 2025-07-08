import { createFileRoute } from '@tanstack/react-router';

import LoginPage from '../../pages/auth/login';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || '/dashboard',
  }),
});
