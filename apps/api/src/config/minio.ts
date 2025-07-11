import { Client } from 'minio';

import { config } from '@/config/app';
import { logger } from '@/utils/logger';

/**
 * MinIO client instance
 */
export const minioClient = new Client({
  endPoint: config.minio.endpoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
  region: config.minio.region,
});

/**
 * Initialize MinIO connection and create default bucket if it doesn't exist
 */
export async function initializeMinIO(): Promise<void> {
  try {
    // Test connection
    await minioClient.listBuckets();
    logger.info('MinIO connection established successfully');

    // Check if default bucket exists, create if not
    const bucketExists = await minioClient.bucketExists(config.minio.defaultBucket);
    
    if (!bucketExists) {
      await minioClient.makeBucket(config.minio.defaultBucket, config.minio.region);
      logger.info(`Created default bucket: ${config.minio.defaultBucket}`);
    } else {
      logger.info(`Default bucket already exists: ${config.minio.defaultBucket}`);
    }
  } catch (error) {
    logger.error('Failed to initialize MinIO:', error);
    throw error;
  }
}

/**
 * MinIO configuration object
 */
export const minioConfig = {
  client: minioClient,
  defaultBucket: config.minio.defaultBucket,
  region: config.minio.region,
  initialize: initializeMinIO,
} as const;
