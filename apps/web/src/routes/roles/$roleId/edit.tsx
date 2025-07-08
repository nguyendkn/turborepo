/**
 * Edit Role Route
 * Route for editing existing roles
 */

import { createFileRoute } from '@tanstack/react-router';

import { RoleFormPage } from '@/pages/roles';

export const Route = createFileRoute('/roles/$roleId/edit')({
  component: RoleFormPage,
});
