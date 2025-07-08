/**
 * Edit Policy Route
 * Route for editing existing policies
 */

import { createFileRoute } from '@tanstack/react-router';

import { PolicyFormPage } from '@/pages/policies';

export const Route = createFileRoute('/policies/$policyId/edit')({
  component: PolicyFormPage,
});
