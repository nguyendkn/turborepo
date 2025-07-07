import Redis from 'ioredis';

import { config } from '@/config/app';
import { logger } from '@/utils/logger';

/**
 * Redis client instance
 */
let client: Redis | null = null;

/**
 * Get Redis client
 */
export function getRedisClient(): Redis {
  if (!client) {
    if (config.redis.url) {
      client = new Redis(config.redis.url);
    } else {
      const redisOptions: {
        host: string;
        port: number;
        db: number;
        password?: string;
      } = {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      };

      if (config.redis.password) {
        redisOptions.password = config.redis.password;
      }

      client = new Redis(redisOptions);
    }

    client.on('error', err => {
      logger.error('Redis client error:', err);
    });

    client.on('connect', () => {
      logger.debug('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('end', () => {
      logger.debug('Redis client disconnected');
    });
  }

  return client;
}

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<void> {
  try {
    const redisClient = getRedisClient();
    if (redisClient.status !== 'ready') {
      await redisClient.connect();
    }
    logger.info('Redis connection successful');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (redisClient.status !== 'ready') {
      await redisClient.connect();
    }
    await redisClient.ping();
    logger.info('Redis connection test successful');
    return true;
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (client && client.status !== 'end') {
    await client.quit();
    client = null;
    logger.info('Redis connection closed');
  }
}
