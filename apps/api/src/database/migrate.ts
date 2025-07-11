import { databaseSeed } from './seed';

import { logger } from '@/utils/logger';

/**
 * Database migration and seeding utilities
 */
export const databaseMigrate = {
  /**
   * Run database migrations
   */
  migrate: async () => {
    logger.info('Running database migrations...');
    // Implement database migration logic here if needed
    logger.info('Database migrations completed');
  },

  /**
   * Seed database with initial data
   */
  seed: async () => {
    await databaseSeed.seed();
  },
};
