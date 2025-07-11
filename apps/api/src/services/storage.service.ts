import { Readable } from 'stream';

import type { BucketItem, BucketItemStat } from 'minio';

import { minioClient, minioConfig } from '@/config/minio';
import type {
  BucketCreationOptions,
  BucketInfo,
  FileDeletionOptions,
  FileDownloadOptions,
  FileListOptions,
  FileListResult,
  FileMetadata,
  FileUploadOptions,
  FileUploadResult,
  PresignedUrlOptions,
  StorageError,
  StorageErrorType
} from '@/types/storage';
import { logger } from '@/utils/logger';

/**
 * Create a storage error with proper typing
 */
function createStorageError(
  type: StorageErrorType,
  message: string,
  bucket?: string,
  key?: string,
  originalError?: Error
): StorageError {
  const error = new Error(message) as StorageError;
  error.type = type;
  error.bucket = bucket;
  error.key = key;
  error.originalError = originalError;
  return error;
}

/**
 * Type guard to check if error has a code property
 */
function hasErrorCode(error: unknown): error is { code: string; message?: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

/**
 * Convert MinIO error to storage error
 */
function handleMinioError(error: unknown, bucket?: string, key?: string): StorageError {
  logger.error('MinIO operation failed:', { error, bucket, key });

  if (hasErrorCode(error)) {
    const originalError = error instanceof Error ? error : undefined;

    if (error.code === 'NoSuchBucket') {
      return createStorageError('BUCKET_NOT_FOUND', `Bucket '${bucket}' not found`, bucket, key, originalError);
    }

    if (error.code === 'NoSuchKey') {
      return createStorageError('FILE_NOT_FOUND', `File '${key}' not found in bucket '${bucket}'`, bucket, key, originalError);
    }

    if (error.code === 'AccessDenied') {
      return createStorageError('ACCESS_DENIED', 'Access denied to the resource', bucket, key, originalError);
    }

    if (error.code === 'InvalidBucketName') {
      return createStorageError('INVALID_BUCKET_NAME', `Invalid bucket name: ${bucket}`, bucket, key, originalError);
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return createStorageError('NETWORK_ERROR', 'Network connection failed', bucket, key, originalError);
    }
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
  const originalError = error instanceof Error ? error : undefined;
  return createStorageError('UNKNOWN_ERROR', errorMessage, bucket, key, originalError);
}

/**
 * Convert BucketItem to FileMetadata
 */
function bucketItemToFileMetadata(item: BucketItem, bucket: string): FileMetadata {
  return {
    key: item.name || '',
    size: item.size || 0,
    lastModified: item.lastModified || new Date(),
    etag: item.etag || '',
    bucket,
    contentType: undefined, // BucketItem doesn't include content type
  };
}

/**
 * Convert BucketItemStat to FileMetadata
 */
function bucketItemStatToFileMetadata(stat: BucketItemStat, key: string, bucket: string): FileMetadata {
  return {
    key,
    size: stat.size,
    lastModified: stat.lastModified,
    etag: stat.etag,
    contentType: stat.metaData?.['content-type'],
    metadata: stat.metaData,
    bucket,
  };
}

/**
 * Storage service implementation
 */
export const storageService = {
  /**
   * Upload a file to MinIO
   */
  async uploadFile(
    fileData: Buffer | Readable | string,
    options: FileUploadOptions
  ): Promise<FileUploadResult> {
    const bucket = options.bucket || minioConfig.defaultBucket;
    const { key, contentType, metadata, size } = options;

    try {
      // Ensure bucket exists
      await this.ensureBucketExists(bucket);

      // Prepare metadata
      const minioMetadata: Record<string, string> = {
        ...metadata,
      };

      if (contentType) {
        minioMetadata['Content-Type'] = contentType;
      }

      // Upload file
      const result = await minioClient.putObject(
        bucket,
        key,
        fileData,
        size,
        minioMetadata
      );

      const uploadResult: FileUploadResult = {
        key,
        bucket,
        size: size || 0,
        etag: result.etag,
        uploadedAt: new Date(),
      };

      // Generate URLs if needed
      if (options.isPublic) {
        uploadResult.publicUrl = await this.getPublicUrl(bucket, key);
      } else {
        uploadResult.signedUrl = await this.getPresignedUrl({
          bucket,
          key,
          expiresIn: 3600, // 1 hour
        });
      }

      logger.info('File uploaded successfully', { bucket, key, size });
      return uploadResult;
    } catch (error) {
      throw handleMinioError(error, bucket, key);
    }
  },

  /**
   * Download a file from MinIO
   */
  async downloadFile(options: FileDownloadOptions): Promise<Readable> {
    const bucket = options.bucket || minioConfig.defaultBucket;
    const { key, range } = options;

    try {
      if (range) {
        return await minioClient.getPartialObject(bucket, key, range.start, range.end);
      } else {
        return await minioClient.getObject(bucket, key);
      }
    } catch (error) {
      throw handleMinioError(error, bucket, key);
    }
  },

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: string, key: string): Promise<FileMetadata> {
    const targetBucket = bucket || minioConfig.defaultBucket;

    try {
      const stat = await minioClient.statObject(targetBucket, key);
      return bucketItemStatToFileMetadata(stat, key, targetBucket);
    } catch (error) {
      throw handleMinioError(error, targetBucket, key);
    }
  },

  /**
   * Delete a file from MinIO
   */
  async deleteFile(options: FileDeletionOptions): Promise<void> {
    const bucket = options.bucket || minioConfig.defaultBucket;
    const { key } = options;

    try {
      await minioClient.removeObject(bucket, key);
      logger.info('File deleted successfully', { bucket, key });
    } catch (error) {
      throw handleMinioError(error, bucket, key);
    }
  },

  /**
   * List files in a bucket
   */
  async listFiles(options: FileListOptions = {}): Promise<FileListResult> {
    const bucket = options.bucket || minioConfig.defaultBucket;
    const { prefix, maxKeys = 1000, recursive = true } = options;

    try {
      const files: FileMetadata[] = [];
      const stream = minioClient.listObjects(bucket, prefix, recursive);

      let count = 0;
      for await (const item of stream) {
        if (maxKeys && count >= maxKeys) {
          break;
        }
        files.push(bucketItemToFileMetadata(item, bucket));
        count++;
      }

      return {
        files,
        hasMore: count >= (maxKeys || 1000),
        totalCount: files.length,
      };
    } catch (error) {
      throw handleMinioError(error, bucket);
    }
  },

  /**
   * Generate a presigned URL for file access
   */
  async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
    const bucket = options.bucket || minioConfig.defaultBucket;
    const { key, expiresIn = 3600, method = 'GET', headers } = options;

    try {
      return await minioClient.presignedUrl(method, bucket, key, expiresIn, headers);
    } catch (error) {
      throw handleMinioError(error, bucket, key);
    }
  },

  /**
   * Get public URL for a file (if bucket is public)
   */
  async getPublicUrl(bucket: string, key: string): Promise<string> {
    const targetBucket = bucket || minioConfig.defaultBucket;

    // For MinIO, public URLs follow the pattern: http(s)://endpoint:port/bucket/key
    // Use config values from app config
    const { config } = await import('@/config/app');
    const protocol = config.minio.useSSL ? 'https:' : 'http:';
    const endpoint = config.minio.endpoint;
    const port = config.minio.port;

    return `${protocol}//${endpoint}:${port}/${targetBucket}/${key}`;
  },

  /**
   * Check if a bucket exists
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      return await minioClient.bucketExists(bucketName);
    } catch (error) {
      throw handleMinioError(error, bucketName);
    }
  },

  /**
   * Create a new bucket
   */
  async createBucket(options: BucketCreationOptions): Promise<BucketInfo> {
    const { name, region = minioConfig.region } = options;

    try {
      await minioClient.makeBucket(name, region);

      logger.info('Bucket created successfully', { name, region });

      return {
        name,
        creationDate: new Date(),
        region,
        isPublic: options.isPublic,
      };
    } catch (error) {
      throw handleMinioError(error, name);
    }
  },

  /**
   * List all buckets
   */
  async listBuckets(): Promise<BucketInfo[]> {
    try {
      const buckets = await minioClient.listBuckets();
      return buckets.map(bucket => ({
        name: bucket.name,
        creationDate: bucket.creationDate,
      }));
    } catch (error) {
      throw handleMinioError(error);
    }
  },

  /**
   * Delete a bucket
   */
  async deleteBucket(bucketName: string): Promise<void> {
    try {
      await minioClient.removeBucket(bucketName);
      logger.info('Bucket deleted successfully', { bucketName });
    } catch (error) {
      throw handleMinioError(error, bucketName);
    }
  },

  /**
   * Ensure a bucket exists, create if it doesn't
   */
  async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        await this.createBucket({ name: bucketName });
      }
    } catch (error) {
      throw handleMinioError(error, bucketName);
    }
  },
};
