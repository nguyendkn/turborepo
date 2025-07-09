import mongoose from 'mongoose';

import { config } from '@/config/app';
import { logger } from '@/utils/logger';

/**
 * MongoDB connection instance
 */
let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    logger.debug('Already connected to MongoDB');
    return;
  }

  try {
    const connectionString = config.database.url ||
      `mongodb://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`;

    await mongoose.connect(connectionString, {
      maxPoolSize: 20, // Maximum number of connections in the connection pool
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    isConnected = true;
    logger.info('Connected to MongoDB successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    isConnected = false;
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!isConnected) {
      await connectToDatabase();
    }

    // Test the connection by running a simple operation
    await mongoose.connection.db?.admin().ping();
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('Database connection closed');
  }
}
