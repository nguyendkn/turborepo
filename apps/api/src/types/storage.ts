
/**
 * File upload options
 */
export interface FileUploadOptions {
  /** Target bucket name */
  bucket?: string | undefined;
  /** File path/key in the bucket */
  key: string;
  /** Content type of the file */
  contentType?: string | undefined;
  /** Custom metadata for the file */
  metadata?: Record<string, string> | undefined;
  /** Whether the file should be publicly accessible */
  isPublic?: boolean | undefined;
  /** File size in bytes */
  size?: number | undefined;
}

/**
 * File download options
 */
export interface FileDownloadOptions {
  /** Source bucket name */
  bucket?: string | undefined;
  /** File path/key in the bucket */
  key: string;
  /** Byte range for partial download */
  range?: {
    start: number;
    end?: number;
  } | undefined;
}

/**
 * File deletion options
 */
export interface FileDeletionOptions {
  /** Source bucket name */
  bucket?: string | undefined;
  /** File path/key in the bucket */
  key: string;
}

/**
 * File listing options
 */
export interface FileListOptions {
  /** Source bucket name */
  bucket?: string;
  /** Prefix to filter files */
  prefix?: string;
  /** Maximum number of files to return */
  maxKeys?: number;
  /** Continuation token for pagination */
  continuationToken?: string;
  /** Whether to include directories */
  recursive?: boolean;
}

/**
 * File metadata information
 */
export interface FileMetadata {
  /** File key/path */
  key: string;
  /** File size in bytes */
  size: number;
  /** Last modified date */
  lastModified: Date;
  /** Content type */
  contentType?: string | undefined;
  /** ETag of the file */
  etag: string;
  /** Custom metadata */
  metadata?: Record<string, string> | undefined;
  /** Bucket name */
  bucket: string;
  /** Whether the file is publicly accessible */
  isPublic?: boolean | undefined;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  /** File key/path */
  key: string;
  /** Bucket name */
  bucket: string;
  /** File size in bytes */
  size: number;
  /** ETag of the uploaded file */
  etag: string;
  /** Public URL if the file is public */
  publicUrl?: string;
  /** Signed URL for private access */
  signedUrl?: string;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * File list result
 */
export interface FileListResult {
  /** List of files */
  files: FileMetadata[];
  /** Whether there are more files */
  hasMore: boolean;
  /** Continuation token for next page */
  continuationToken?: string;
  /** Total count (if available) */
  totalCount?: number;
}

/**
 * Bucket information
 */
export interface BucketInfo {
  /** Bucket name */
  name: string;
  /** Creation date */
  creationDate: Date;
  /** Bucket region */
  region?: string | undefined;
  /** Whether the bucket is public */
  isPublic?: boolean | undefined;
}

/**
 * Bucket creation options
 */
export interface BucketCreationOptions {
  /** Bucket name */
  name: string;
  /** Bucket region */
  region?: string | undefined;
  /** Whether the bucket should be public */
  isPublic?: boolean | undefined;
}

/**
 * Presigned URL options
 */
export interface PresignedUrlOptions {
  /** Source bucket name */
  bucket?: string;
  /** File path/key in the bucket */
  key: string;
  /** URL expiration time in seconds */
  expiresIn?: number;
  /** HTTP method for the presigned URL */
  method?: 'GET' | 'PUT' | 'DELETE';
  /** Additional request headers */
  headers?: Record<string, string>;
}

/**
 * Storage service error types
 */
export type StorageErrorType =
  | 'BUCKET_NOT_FOUND'
  | 'FILE_NOT_FOUND'
  | 'ACCESS_DENIED'
  | 'INVALID_BUCKET_NAME'
  | 'INVALID_KEY'
  | 'FILE_TOO_LARGE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Storage service error
 */
export interface StorageError extends Error {
  type: StorageErrorType;
  bucket?: string | undefined;
  key?: string | undefined;
  originalError?: Error | undefined;
}

/**
 * Storage service configuration
 */
export interface StorageConfig {
  /** Default bucket name */
  defaultBucket: string;
  /** Default region */
  defaultRegion: string;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Default presigned URL expiration in seconds */
  defaultUrlExpiration: number;
  /** Allowed file types */
  allowedMimeTypes?: string[];
  /** Forbidden file types */
  forbiddenMimeTypes?: string[];
}

/**
 * Extended MinIO BucketItem with additional metadata
 */
export interface ExtendedBucketItem {
  /** File name */
  name: string;
  /** File size */
  size: number;
  /** Last modified date */
  lastModified: Date;
  /** ETag */
  etag: string;
  /** File metadata */
  metadata?: Record<string, string>;
  /** Public URL if available */
  publicUrl?: string;
}

/**
 * Extended MinIO BucketItemStat with additional metadata
 */
export interface ExtendedBucketItemStat {
  /** File size */
  size: number;
  /** Last modified date */
  lastModified: Date;
  /** ETag */
  etag: string;
  /** Metadata */
  metaData?: Record<string, string>;
  /** Public URL if available */
  publicUrl?: string;
  /** Whether the file is publicly accessible */
  isPublic?: boolean;
}
