import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

import { storageService } from '@/services/storage.service';
import type {
  FileListOptions,
  FileUploadOptions,
  PresignedUrlOptions,
  StorageError,
} from '@/types/storage';
import { bucketManager } from '@/utils/bucket-manager';
import { logger } from '@/utils/logger';

/**
 * Type guard to check if error is a StorageError
 */
function isStorageError(error: unknown): error is StorageError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as StorageError).type === 'string'
  );
}

/**
 * Helper function to handle storage errors
 */
function handleStorageError(error: unknown): HTTPException {
  if (isStorageError(error)) {
    switch (error.type) {
      case 'FILE_NOT_FOUND':
        return new HTTPException(404, { message: 'File not found' });
      case 'BUCKET_NOT_FOUND':
        return new HTTPException(404, { message: 'Bucket not found' });
      case 'ACCESS_DENIED':
        return new HTTPException(403, { message: 'Access denied' });
      case 'INVALID_BUCKET_NAME':
        return new HTTPException(400, { message: 'Invalid bucket name' });
      case 'INVALID_KEY':
        return new HTTPException(400, { message: 'Invalid file key' });
      case 'FILE_TOO_LARGE':
        return new HTTPException(413, { message: 'File too large' });
      case 'NETWORK_ERROR':
        return new HTTPException(503, { message: 'Storage service unavailable' });
      default:
        return new HTTPException(500, {
          message: error.message || 'Storage operation failed'
        });
    }
  }

  if (error instanceof Error) {
    return new HTTPException(500, { message: error.message });
  }

  return new HTTPException(500, { message: 'Unknown storage error' });
}

/**
 * File upload validation schema
 */
const fileUploadSchema = z.object({
  key: z.string().min(1, 'File key is required'),
  bucket: z.string().optional(),
  contentType: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  metadata: z.record(z.string()).optional(),
});

/**
 * File list validation schema
 */
const fileListSchema = z.object({
  bucket: z.string().optional(),
  prefix: z.string().optional(),
  maxKeys: z.number().int().min(1).max(1000).optional().default(100),
  recursive: z.boolean().optional().default(true),
});

/**
 * Presigned URL validation schema
 */
const presignedUrlSchema = z.object({
  bucket: z.string().optional(),
  key: z.string().min(1, 'File key is required'),
  expiresIn: z.number().int().min(60).max(604800).optional().default(3600), // 1 minute to 7 days
  method: z.enum(['GET', 'PUT', 'DELETE']).optional().default('GET'),
});

/**
 * Bucket creation validation schema
 */
const bucketCreationSchema = z.object({
  name: z.string().min(3).max(63),
  region: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

/**
 * Storage controller
 */
export const storageController = {
  /**
   * Upload a file
   */
  async uploadFile(c: Context) {
    try {
      const body = await c.req.parseBody();
      const file = body.file;

      if (!file || typeof file === 'string') {
        throw new HTTPException(400, { message: 'No file provided' });
      }

      // Handle File object - simplified approach
      let fileBuffer: Buffer;
      let fileName: string;
      let contentType: string | undefined;

      // Check if it's a File-like object with required methods
      if (typeof file === 'object' && file !== null && 'arrayBuffer' in file) {
        const fileObj = file as {
          arrayBuffer(): Promise<ArrayBuffer>;
          name?: string;
          type?: string;
        };
        fileBuffer = Buffer.from(await fileObj.arrayBuffer());
        fileName = fileObj.name || 'unknown';
        contentType = fileObj.type;
      } else {
        throw new HTTPException(400, { message: 'Invalid file format' });
      }

      const options = fileUploadSchema.parse({
        key: body.key || fileName,
        bucket: body.bucket || undefined,
        contentType: contentType || undefined,
        isPublic: body.isPublic === 'true',
        metadata: body.metadata
          ? JSON.parse(body.metadata as string)
          : undefined,
      });

      const uploadOptions: FileUploadOptions = {
        key: options.key,
        bucket: options.bucket,
        contentType: options.contentType,
        isPublic: options.isPublic,
        metadata: options.metadata,
        size: fileBuffer.length,
      };

      const result = await storageService.uploadFile(fileBuffer, uploadOptions);

      return c.json({
        success: true,
        data: result,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      logger.error('File upload failed:', error);

      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'File upload failed',
      });
    }
  },

  /**
   * Download a file
   */
  async downloadFile(c: Context) {
    try {
      const { bucket, key } = c.req.param();

      if (!key) {
        throw new HTTPException(400, { message: 'File key is required' });
      }

      const fileStream = await storageService.downloadFile({
        bucket: bucket || undefined,
        key,
      });
      const metadata = await storageService.getFileMetadata(bucket || '', key);

      // Set appropriate headers
      c.header(
        'Content-Type',
        metadata.contentType || 'application/octet-stream'
      );
      c.header('Content-Length', metadata.size.toString());
      c.header('Content-Disposition', `attachment; filename="${key}"`);

      // Convert stream to buffer for Hono
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);

      return c.body(fileBuffer);
    } catch (error) {
      logger.error('File download failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * Get file metadata
   */
  async getFileMetadata(c: Context) {
    try {
      const { bucket, key } = c.req.param();

      if (!key) {
        throw new HTTPException(400, { message: 'File key is required' });
      }

      const metadata = await storageService.getFileMetadata(bucket || '', key);

      return c.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      logger.error('Get file metadata failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(c: Context) {
    try {
      const { bucket, key } = c.req.param();

      if (!key) {
        throw new HTTPException(400, { message: 'File key is required' });
      }

      await storageService.deleteFile({ bucket, key });

      return c.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * List files in a bucket
   */
  async listFiles(c: Context) {
    try {
      const query = c.req.query();
      const options = fileListSchema.parse(query);

      const result = await storageService.listFiles(options as FileListOptions);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List files failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * Generate presigned URL
   */
  async getPresignedUrl(c: Context) {
    try {
      const body = await c.req.json();
      const options = presignedUrlSchema.parse(body);

      const url = await storageService.getPresignedUrl(
        options as PresignedUrlOptions
      );

      return c.json({
        success: true,
        data: { url },
      });
    } catch (error) {
      logger.error('Generate presigned URL failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * Create a bucket
   */
  async createBucket(c: Context) {
    try {
      const body = await c.req.json();
      const options = bucketCreationSchema.parse(body);

      const bucket = await bucketManager.createBucket(options);

      return c.json({
        success: true,
        data: bucket,
        message: 'Bucket created successfully',
      });
    } catch (error) {
      logger.error('Bucket creation failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * List buckets
   */
  async listBuckets(c: Context) {
    try {
      const buckets = await bucketManager.listBucketsWithInfo();

      return c.json({
        success: true,
        data: buckets,
      });
    } catch (error) {
      logger.error('List buckets failed:', error);
      throw handleStorageError(error);
    }
  },

  /**
   * Get bucket information
   */
  async getBucketInfo(c: Context) {
    try {
      const { bucket } = c.req.param();

      if (!bucket) {
        throw new HTTPException(400, { message: 'Bucket name is required' });
      }

      const bucketInfo = await bucketManager.getBucketInfo(bucket);

      if (!bucketInfo) {
        throw new HTTPException(404, { message: 'Bucket not found' });
      }

      return c.json({
        success: true,
        data: bucketInfo,
      });
    } catch (error) {
      logger.error('Get bucket info failed:', error);

      if (error instanceof HTTPException) {
        throw error;
      }

      throw handleStorageError(error);
    }
  },

  /**
   * Delete a bucket
   */
  async deleteBucket(c: Context) {
    try {
      const { bucket } = c.req.param();

      if (!bucket) {
        throw new HTTPException(400, { message: 'Bucket name is required' });
      }

      await storageService.deleteBucket(bucket);

      return c.json({
        success: true,
        message: 'Bucket deleted successfully',
      });
    } catch (error) {
      logger.error('Bucket deletion failed:', error);
      throw handleStorageError(error);
    }
  },
};
