/**
 * Policies Layout Route
 * Layout for all policy management routes
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/policies')({
  component: PoliciesLayout,
});

function PoliciesLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Outlet />
      </div>
    </div>
  );
}
