// import { ClientSession, startSession } from 'mongoose';

// import { logger } from '@/utils/logger';

// /**
//  * Database transaction utility for ensuring data consistency
//  */
// export class DatabaseTransaction {
//   private session: ClientSession | null = null;

//   /**
//    * Start a new transaction
//    */
//   async start(): Promise<void> {
//     try {
//       this.session = await startSession();
//       this.session.startTransaction();
//       logger.debug('Database transaction started');
//     } catch (error) {
//       logger.error('Failed to start database transaction:', error);
//       throw new Error(`Failed to start transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   /**
//    * Commit the transaction
//    */
//   async commit(): Promise<void> {
//     if (!this.session) {
//       throw new Error('No active transaction to commit');
//     }

//     try {
//       await this.session.commitTransaction();
//       logger.debug('Database transaction committed');
//     } catch (error) {
//       logger.error('Failed to commit database transaction:', error);
//       throw new Error(`Failed to commit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       await this.session.endSession();
//       this.session = null;
//     }
//   }

//   /**
//    * Abort the transaction
//    */
//   async abort(): Promise<void> {
//     if (!this.session) {
//       logger.warn('No active transaction to abort');
//       return;
//     }

//     try {
//       await this.session.abortTransaction();
//       logger.debug('Database transaction aborted');
//     } catch (error) {
//       logger.error('Failed to abort database transaction:', error);
//     } finally {
//       await this.session.endSession();
//       this.session = null;
//     }
//   }

//   /**
//    * Get the current session
//    */
//   getSession(): ClientSession | null {
//     return this.session;
//   }

//   /**
//    * Execute a function within a transaction
//    */
//   static async execute<T>(
//     operation: (session: ClientSession) => Promise<T>
//   ): Promise<T> {
//     const transaction = new DatabaseTransaction();

//     try {
//       await transaction.start();
//       const session = transaction.getSession();

//       if (!session) {
//         throw new Error('Failed to get transaction session');
//       }

//       const result = await operation(session);
//       await transaction.commit();

//       return result;
//     } catch (error) {
//       await transaction.abort();
//       throw error;
//     }
//   }
// }

// /**
//  * Storage operation error types
//  */
// export type StorageOperationErrorType =
//   | 'VALIDATION_ERROR'
//   | 'DATABASE_ERROR'
//   | 'STORAGE_ERROR'
//   | 'CONSISTENCY_ERROR'
//   | 'PERMISSION_ERROR'
//   | 'QUOTA_EXCEEDED'
//   | 'FILE_NOT_FOUND'
//   | 'DUPLICATE_FILE'
//   | 'INVALID_OPERATION';

// /**
//  * Storage operation error
//  */
// export class StorageOperationError extends Error {
//   public readonly type: StorageOperationErrorType;
//   public readonly details?: Record<string, unknown>;
//   public readonly originalError?: Error;

//   constructor(
//     type: StorageOperationErrorType,
//     message: string,
//     details?: Record<string, unknown>,
//     originalError?: Error
//   ) {
//     super(message);
//     this.name = 'StorageOperationError';
//     this.type = type;
//     this.details = details;
//     this.originalError = originalError;
//   }
// }

// /**
//  * Validation utilities
//  */
// export class ValidationUtils {
//   /**
//    * Validate file size
//    */
//   static validateFileSize(size: number, maxSize: number): void {
//     if (size <= 0) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'File size must be greater than 0',
//         { size }
//       );
//     }

//     if (size > maxSize) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         `File size ${size} exceeds maximum allowed size ${maxSize}`,
//         { size, maxSize }
//       );
//     }
//   }

//   /**
//    * Validate file name
//    */
//   static validateFileName(fileName: string): void {
//     if (!fileName || fileName.trim().length === 0) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'File name cannot be empty'
//       );
//     }

//     if (fileName.length > 255) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'File name cannot exceed 255 characters',
//         { fileName, length: fileName.length }
//       );
//     }

//     // Check for invalid characters
//     const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
//     if (invalidChars.test(fileName)) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'File name contains invalid characters',
//         { fileName }
//       );
//     }
//   }

//   /**
//    * Validate MIME type
//    */
//   static validateMimeType(mimeType: string, allowedTypes?: string[]): void {
//     if (!mimeType || mimeType.trim().length === 0) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'MIME type cannot be empty'
//       );
//     }

//     // Basic MIME type format validation
//     const mimeTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
//     if (!mimeTypeRegex.test(mimeType)) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Invalid MIME type format',
//         { mimeType }
//       );
//     }

//     if (allowedTypes && allowedTypes.length > 0) {
//       const isAllowed = allowedTypes.some(allowed => {
//         if (allowed.endsWith('/*')) {
//           const category = allowed.slice(0, -2);
//           return mimeType.startsWith(category + '/');
//         }
//         return mimeType === allowed;
//       });

//       if (!isAllowed) {
//         throw new StorageOperationError(
//           'VALIDATION_ERROR',
//           'MIME type not allowed',
//           { mimeType, allowedTypes }
//         );
//       }
//     }
//   }

//   /**
//    * Validate bucket name
//    */
//   static validateBucketName(bucketName: string): void {
//     if (!bucketName || bucketName.trim().length === 0) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Bucket name cannot be empty'
//       );
//     }

//     if (bucketName.length < 3 || bucketName.length > 63) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Bucket name must be between 3 and 63 characters',
//         { bucketName, length: bucketName.length }
//       );
//     }

//     // S3 bucket naming rules
//     const bucketNameRegex = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/;
//     if (!bucketNameRegex.test(bucketName)) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Invalid bucket name format',
//         { bucketName }
//       );
//     }

//     // Cannot contain consecutive periods
//     if (bucketName.includes('..')) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Bucket name cannot contain consecutive periods',
//         { bucketName }
//       );
//     }
//   }

//   /**
//    * Validate object key
//    */
//   static validateObjectKey(key: string): void {
//     if (!key || key.trim().length === 0) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Object key cannot be empty'
//       );
//     }

//     if (key.length > 1024) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Object key cannot exceed 1024 characters',
//         { key, length: key.length }
//       );
//     }

//     // Check for invalid characters in object key
//     const invalidChars = /[\x00-\x1f\x7f]/;
//     if (invalidChars.test(key)) {
//       throw new StorageOperationError(
//         'VALIDATION_ERROR',
//         'Object key contains invalid characters',
//         { key }
//       );
//     }
//   }
// }

// /**
//  * Consistency checker for storage operations
//  */
// export class ConsistencyChecker {
//   /**
//    * Check if file exists in both storage and database
//    */
//   static async checkFileConsistency(
//     bucket: string,
//     key: string,
//     fileId?: string
//   ): Promise<{
//     inStorage: boolean;
//     inDatabase: boolean;
//     consistent: boolean;
//     details?: Record<string, unknown>;
//   }> {
//     try {
//       // This would need to be implemented with actual storage and database checks
//       // For now, return a placeholder
//       return {
//         inStorage: true,
//         inDatabase: true,
//         consistent: true,
//       };
//     } catch (error) {
//       logger.error('Failed to check file consistency:', { error, bucket, key, fileId });
//       throw new StorageOperationError(
//         'CONSISTENCY_ERROR',
//         'Failed to check file consistency',
//         { bucket, key, fileId },
//         error instanceof Error ? error : undefined
//       );
//     }
//   }
// }
