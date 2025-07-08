/**
 * Role Detail Layout Route
 * Layout for individual role pages
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/roles/$roleId')({
  component: RoleDetailLayout,
});

function RoleDetailLayout() {
  return <Outlet />;
}
