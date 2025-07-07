import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { config } from '@/config/app';
import { logger } from '@/utils/logger';

/**
 * Database connection pool
 */
let pool: Pool | null = null;

/**
 * Get database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionConfig = config.database.url
      ? { connectionString: config.database.url }
      : {
          host: config.database.host,
          port: config.database.port,
          database: config.database.name,
          user: config.database.user,
          password: config.database.password,
          ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        };

    pool = new Pool({
      ...connectionConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', err => {
      logger.error('Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      logger.debug('Database client connected');
    });

    pool.on('remove', () => {
      logger.debug('Database client removed');
    });
  }

  return pool;
}

/**
 * Drizzle database instance
 */
export const db = drizzle(getPool());

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}
