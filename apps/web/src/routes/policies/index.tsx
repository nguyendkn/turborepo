/**
 * Policies Index Route
 * Main policies listing page
 */

import { createFileRoute } from '@tanstack/react-router';

import { PoliciesPage } from '@/pages/policies';

export const Route = createFileRoute('/policies/')({
  component: PoliciesPage,
});
