import { Types } from 'mongoose';

import { File, type IFile } from '@/database/models';
import type {
  FileCreateOptions,
  FileQueryOptions,
  FileQueryResult,
  FileRecord,
  FileStatus,
  FileUpdateOptions,
} from '@/types/storage';
import { logger } from '@/utils/logger';

/**
 * File repository for database operations
 */
export class FileRepository {
  /**
   * Create a new file record
   */
  async create(options: FileCreateOptions): Promise<FileRecord> {
    try {
      const file = new File({
        originalName: options.originalName,
        fileName: options.fileName,
        filePath: options.filePath,
        size: options.size,
        mimeType: options.mimeType,
        bucket: options.bucket,
        key: options.key,
        userId: new Types.ObjectId(options.userId),
        status: options.status || 'UPLOADING',
        isPublic: options.isPublic || false,
        metadata: options.metadata,
        fileHash: options.fileHash,
        uploadId: options.uploadId,
      });

      const savedFile = await file.save();
      return this.toFileRecord(savedFile);
    } catch (error) {
      logger.error('Failed to create file record:', { error, options });
      throw new Error(`Failed to create file record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find file by ID
   */
  async findById(id: string): Promise<FileRecord | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const file = await File.findById(id).populate('userId', 'email firstName lastName');
      return file ? this.toFileRecord(file) : null;
    } catch (error) {
      logger.error('Failed to find file by ID:', { error, id });
      throw new Error(`Failed to find file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find file by bucket and key
   */
  async findByKey(bucket: string, key: string): Promise<FileRecord | null> {
    try {
      const file = await File.findOne({ 
        bucket, 
        key, 
        deletedAt: { $exists: false } 
      }).populate('userId', 'email firstName lastName');
      
      return file ? this.toFileRecord(file) : null;
    } catch (error) {
      logger.error('Failed to find file by key:', { error, bucket, key });
      throw new Error(`Failed to find file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find files by user ID
   */
  async findByUserId(
    userId: string, 
    options: Omit<FileQueryOptions, 'userId'> = {}
  ): Promise<FileQueryResult> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return {
          files: [],
          total: 0,
          page: 1,
          limit: options.limit || 20,
          hasMore: false,
        };
      }

      return this.query({ ...options, userId });
    } catch (error) {
      logger.error('Failed to find files by user ID:', { error, userId, options });
      throw new Error(`Failed to find files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query files with filters and pagination
   */
  async query(options: FileQueryOptions = {}): Promise<FileQueryResult> {
    try {
      const {
        userId,
        status,
        bucket,
        mimeType,
        isPublic,
        includeDeleted = false,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      // Build filter
      const filter: Record<string, unknown> = {};

      if (userId) {
        filter.userId = new Types.ObjectId(userId);
      }

      if (status) {
        if (Array.isArray(status)) {
          filter.status = { $in: status };
        } else {
          filter.status = status;
        }
      }

      if (bucket) {
        filter.bucket = bucket;
      }

      if (mimeType) {
        filter.mimeType = new RegExp(mimeType, 'i');
      }

      if (typeof isPublic === 'boolean') {
        filter.isPublic = isPublic;
      }

      if (!includeDeleted) {
        filter.deletedAt = { $exists: false };
      }

      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [files, total] = await Promise.all([
        File.find(filter)
          .populate('userId', 'email firstName lastName')
          .sort(sort)
          .skip(offset)
          .limit(limit)
          .lean(),
        File.countDocuments(filter),
      ]);

      const page = Math.floor(offset / limit) + 1;
      const hasMore = offset + limit < total;

      return {
        files: files.map(file => this.toFileRecord(file as IFile)),
        total,
        page,
        limit,
        hasMore,
      };
    } catch (error) {
      logger.error('Failed to query files:', { error, options });
      throw new Error(`Failed to query files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update file record
   */
  async update(id: string, updates: FileUpdateOptions): Promise<FileRecord | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const file = await File.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('userId', 'email firstName lastName');

      return file ? this.toFileRecord(file) : null;
    } catch (error) {
      logger.error('Failed to update file:', { error, id, updates });
      throw new Error(`Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update file status
   */
  async updateStatus(id: string, status: FileStatus): Promise<FileRecord | null> {
    return this.update(id, { status });
  }

  /**
   * Soft delete file
   */
  async softDelete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await File.findByIdAndUpdate(
        id,
        { 
          $set: { 
            deletedAt: new Date(),
            status: 'DELETED' as FileStatus
          } 
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      logger.error('Failed to soft delete file:', { error, id });
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hard delete file (permanent)
   */
  async delete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await File.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Failed to delete file:', { error, id });
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file statistics
   */
  async getStats(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByStatus: Record<FileStatus, number>;
    filesByMimeType: Record<string, number>;
  }> {
    try {
      const filter: Record<string, unknown> = {
        deletedAt: { $exists: false }
      };

      if (userId && Types.ObjectId.isValid(userId)) {
        filter.userId = new Types.ObjectId(userId);
      }

      const [totalStats, statusStats, mimeTypeStats] = await Promise.all([
        File.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalFiles: { $sum: 1 },
              totalSize: { $sum: '$size' },
            },
          },
        ]),
        File.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        File.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$mimeType',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const filesByStatus: Record<FileStatus, number> = {
        UPLOADING: 0,
        COMPLETED: 0,
        FAILED: 0,
        DELETED: 0,
        PROCESSING: 0,
      };

      statusStats.forEach((stat: { _id: FileStatus; count: number }) => {
        filesByStatus[stat._id] = stat.count;
      });

      const filesByMimeType: Record<string, number> = {};
      mimeTypeStats.forEach((stat: { _id: string; count: number }) => {
        filesByMimeType[stat._id] = stat.count;
      });

      return {
        totalFiles: totalStats[0]?.totalFiles || 0,
        totalSize: totalStats[0]?.totalSize || 0,
        filesByStatus,
        filesByMimeType,
      };
    } catch (error) {
      logger.error('Failed to get file stats:', { error, userId });
      throw new Error(`Failed to get file stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert IFile to FileRecord
   */
  private toFileRecord(file: IFile): FileRecord {
    return {
      _id: file._id.toString(),
      originalName: file.originalName,
      fileName: file.fileName,
      filePath: file.filePath,
      size: file.size,
      mimeType: file.mimeType,
      bucket: file.bucket,
      key: file.key,
      userId: file.userId.toString(),
      status: file.status,
      isPublic: file.isPublic,
      metadata: file.metadata ? Object.fromEntries(file.metadata) : undefined,
      fileHash: file.fileHash,
      uploadId: file.uploadId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      deletedAt: file.deletedAt,
    };
  }
}

/**
 * File repository instance
 */
export const fileRepository = new FileRepository();
