/**
 * Create Role Route
 * Route for creating new roles
 */

import { createFileRoute } from '@tanstack/react-router';

import { RoleFormPage } from '@/pages/roles';

export const Route = createFileRoute('/roles/create')({
  component: RoleFormPage,
});
