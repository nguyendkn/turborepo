/**
 * Policy Detail Route
 * Route for individual policy details
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/policies/$policyId')({
  component: PolicyDetailLayout,
});

function PolicyDetailLayout() {
  return <Outlet />;
}
