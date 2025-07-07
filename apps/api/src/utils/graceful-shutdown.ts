import { Server } from 'http';
import { Http2Server } from 'http2';

import { closeConnection } from '@/config/database';
import { closeRedisConnection } from '@/config/redis';
import { logger } from '@/utils/logger';

/**
 * Setup graceful shutdown handlers
 */
export function gracefulShutdown(server: Server | Http2Server): void {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async err => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }

      try {
        // Close database connections
        await closeConnection();

        // Close Redis connections
        await closeRedisConnection();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error);
    void shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    void shutdown('unhandledRejection');
  });
}
