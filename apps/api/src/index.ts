import { serve } from '@hono/node-server';

import { createApp } from '@/app';
import { config } from '@/config/app';
import { connectToDatabase } from '@/config/database';
import { gracefulShutdown } from '@/utils/graceful-shutdown';
import { logger } from '@/utils/logger';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Create the Hono app
    const app = createApp();

    // Start the server
    const server = serve({
      fetch: app.fetch,
      port: config.port,
      hostname: config.host,
    });

    logger.info(`🚀 Server started on ${config.host}:${config.port}`);
    logger.info(`📝 Environment: ${config.env}`);
    logger.info(
      `📚 API Documentation: http://${config.host}:${config.port}/docs`
    );
    logger.info(
      `❤️  Health Check: http://${config.host}:${config.port}/health`
    );

    // Setup graceful shutdown
    gracefulShutdown(server);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.main) {
  void startServer();
}

export { createApp };
