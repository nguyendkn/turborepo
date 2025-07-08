/**
 * Roles Index Route
 * Main roles listing page route
 */

import { createFileRoute } from '@tanstack/react-router';

import { RolesPage } from '@/pages/roles';

export const Route = createFileRoute('/roles/')({
  component: RolesPage,
});
