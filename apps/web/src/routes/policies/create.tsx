/**
 * Create Policy Route
 * Route for creating new policies
 */

import { createFileRoute } from '@tanstack/react-router';

import { PolicyFormPage } from '@/pages/policies';

export const Route = createFileRoute('/policies/create')({
  component: PolicyFormPage,
});
