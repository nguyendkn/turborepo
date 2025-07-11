import { minioClient, minioConfig } from '@/config/minio';
import { storageService } from '@/services/storage.service';
import type { BucketCreationOptions, BucketInfo } from '@/types/storage';
import { logger } from '@/utils/logger';

/**
 * MinIO error interface
 */
interface MinioError extends Error {
  code?: string;
  statusCode?: number;
}

/**
 * S3 Policy Statement interface
 */
interface PolicyStatement {
  Effect: 'Allow' | 'Deny';
  Principal?: {
    AWS?: string | string[];
  };
  Action?: string | string[];
  Resource?: string | string[];
  Condition?: Record<string, unknown>;
}

/**
 * S3 Policy interface
 */
interface S3Policy {
  Version?: string;
  Statement?: PolicyStatement[];
}

/**
 * Bucket policy templates
 */
const BUCKET_POLICIES = {
  /**
   * Public read policy - allows public access to all objects in the bucket
   */
  PUBLIC_READ: (bucketName: string) => ({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  }),

  /**
   * Private policy - no public access
   */
  PRIVATE: () => ({
    Version: '2012-10-17',
    Statement: [],
  }),

  /**
   * Public read-write policy - allows public read and write access
   */
  PUBLIC_READ_WRITE: (bucketName: string) => ({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  }),
};

/**
 * Bucket management utilities
 */
export const bucketManager = {
  /**
   * Create a bucket with specific configuration
   */
  async createBucket(options: BucketCreationOptions): Promise<BucketInfo> {
    const { name, region = minioConfig.region, isPublic = false } = options;

    try {
      // Validate bucket name
      this.validateBucketName(name);

      // Check if bucket already exists
      const exists = await storageService.bucketExists(name);
      if (exists) {
        logger.warn(`Bucket '${name}' already exists`);
        return {
          name,
          creationDate: new Date(),
          region,
          isPublic,
        };
      }

      // Create the bucket
      const bucketInfo = await storageService.createBucket(options);

      // Set bucket policy if public
      if (isPublic) {
        await this.setBucketPolicy(name, 'PUBLIC_READ');
      }

      logger.info(`Bucket '${name}' created successfully`, {
        region,
        isPublic,
      });
      return bucketInfo;
    } catch (error) {
      logger.error(`Failed to create bucket '${name}'`, error);
      throw error;
    }
  },

  /**
   * Set bucket policy
   */
  async setBucketPolicy(
    bucketName: string,
    policyType: 'PUBLIC_READ' | 'PRIVATE' | 'PUBLIC_READ_WRITE'
  ): Promise<void> {
    try {
      const policy = BUCKET_POLICIES[policyType](bucketName);
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      logger.info(`Bucket policy set for '${bucketName}'`, { policyType });
    } catch (error) {
      logger.error(`Failed to set bucket policy for '${bucketName}'`, error);
      throw error;
    }
  },

  /**
   * Get bucket policy
   */
  async getBucketPolicy(bucketName: string): Promise<string | null> {
    try {
      return await minioClient.getBucketPolicy(bucketName);
    } catch (error) {
      if ((error as MinioError).code === 'NoSuchBucketPolicy') {
        return null;
      }
      logger.error(`Failed to get bucket policy for '${bucketName}'`, error);
      throw error;
    }
  },

  /**
   * Remove bucket policy
   */
  async removeBucketPolicy(bucketName: string): Promise<void> {
    try {
      await minioClient.setBucketPolicy(bucketName, '');
      logger.info(`Bucket policy removed for '${bucketName}'`);
    } catch (error) {
      logger.error(`Failed to remove bucket policy for '${bucketName}'`, error);
      throw error;
    }
  },

  /**
   * Check if bucket is public
   */
  async isBucketPublic(bucketName: string): Promise<boolean> {
    try {
      const policy = await this.getBucketPolicy(bucketName);
      if (!policy) return false;

      const policyObj = JSON.parse(policy) as S3Policy;
      return (
        policyObj.Statement?.some(
          (statement: PolicyStatement) =>
            statement.Effect === 'Allow' &&
            statement.Principal?.AWS?.includes('*') &&
            statement.Action?.includes('s3:GetObject')
        ) || false
      );
    } catch (error) {
      logger.error(
        `Failed to check if bucket '${bucketName}' is public`,
        error
      );
      return false;
    }
  },

  /**
   * Get bucket information with additional metadata
   */
  async getBucketInfo(bucketName: string): Promise<BucketInfo | null> {
    try {
      const exists = await storageService.bucketExists(bucketName);
      if (!exists) return null;

      const buckets = await storageService.listBuckets();
      const bucket = buckets.find(b => b.name === bucketName);

      if (!bucket) return null;

      const isPublic = await this.isBucketPublic(bucketName);

      return {
        ...bucket,
        isPublic,
      };
    } catch (error) {
      logger.error(`Failed to get bucket info for '${bucketName}'`, error);
      throw error;
    }
  },

  /**
   * List all buckets with additional metadata
   */
  async listBucketsWithInfo(): Promise<BucketInfo[]> {
    try {
      const buckets = await storageService.listBuckets();

      const bucketsWithInfo = await Promise.all(
        buckets.map(async bucket => {
          const isPublic = await this.isBucketPublic(bucket.name);
          return {
            ...bucket,
            isPublic,
          };
        })
      );

      return bucketsWithInfo;
    } catch (error) {
      logger.error('Failed to list buckets with info', error);
      throw error;
    }
  },

  /**
   * Initialize default buckets
   */
  async initializeDefaultBuckets(): Promise<void> {
    const defaultBuckets = [
      { name: minioConfig.defaultBucket, isPublic: false },
      { name: 'public-uploads', isPublic: true },
      { name: 'private-uploads', isPublic: false },
      { name: 'temp-uploads', isPublic: false },
    ];

    for (const bucketConfig of defaultBuckets) {
      try {
        await this.createBucket(bucketConfig);
      } catch (error) {
        logger.error(
          `Failed to create default bucket '${bucketConfig.name}'`,
          error
        );
      }
    }
  },

  /**
   * Validate bucket name according to AWS S3 naming rules
   */
  validateBucketName(name: string): void {
    if (!name) {
      throw new Error('Bucket name cannot be empty');
    }

    if (name.length < 3 || name.length > 63) {
      throw new Error('Bucket name must be between 3 and 63 characters long');
    }

    if (!/^[a-z0-9.-]+$/.test(name)) {
      throw new Error(
        'Bucket name can only contain lowercase letters, numbers, dots, and hyphens'
      );
    }

    if (name.startsWith('.') || name.endsWith('.')) {
      throw new Error('Bucket name cannot start or end with a dot');
    }

    if (name.startsWith('-') || name.endsWith('-')) {
      throw new Error('Bucket name cannot start or end with a hyphen');
    }

    if (/\.\./.test(name)) {
      throw new Error('Bucket name cannot contain consecutive dots');
    }

    if (/\.-|-\./.test(name)) {
      throw new Error('Bucket name cannot contain dots adjacent to hyphens');
    }

    // Check for IP address format
    if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) {
      throw new Error('Bucket name cannot be formatted as an IP address');
    }
  },

  /**
   * Generate file URL based on bucket visibility
   */
  async generateFileUrl(
    bucketName: string,
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const isPublic = await this.isBucketPublic(bucketName);

      if (isPublic) {
        return await storageService.getPublicUrl(bucketName, key);
      } else {
        return await storageService.getPresignedUrl({
          bucket: bucketName,
          key,
          expiresIn,
        });
      }
    } catch (error) {
      logger.error(`Failed to generate URL for '${bucketName}/${key}'`, error);
      throw error;
    }
  },

  /**
   * Copy file between buckets
   */
  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string
  ): Promise<void> {
    try {
      await minioClient.copyObject(
        targetBucket,
        targetKey,
        `/${sourceBucket}/${sourceKey}`
      );
      logger.info('File copied successfully', {
        source: `${sourceBucket}/${sourceKey}`,
        target: `${targetBucket}/${targetKey}`,
      });
    } catch (error) {
      logger.error('Failed to copy file', {
        source: `${sourceBucket}/${sourceKey}`,
        target: `${targetBucket}/${targetKey}`,
        error,
      });
      throw error;
    }
  },

  /**
   * Move file between buckets
   */
  async moveFile(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string
  ): Promise<void> {
    try {
      // Copy file to target
      await this.copyFile(sourceBucket, sourceKey, targetBucket, targetKey);

      // Delete source file
      await storageService.deleteFile({
        bucket: sourceBucket,
        key: sourceKey,
      });

      logger.info('File moved successfully', {
        source: `${sourceBucket}/${sourceKey}`,
        target: `${targetBucket}/${targetKey}`,
      });
    } catch (error) {
      logger.error('Failed to move file', {
        source: `${sourceBucket}/${sourceKey}`,
        target: `${targetBucket}/${targetKey}`,
        error,
      });
      throw error;
    }
  },
};
