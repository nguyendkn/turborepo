import { Types } from 'mongoose';

import { MultipartUpload, type IMultipartUpload, type IChunkMetadata } from '@/database/models';
import type { MultipartUploadStatus } from '@/types/storage';
import { logger } from '@/utils/logger';

/**
 * Multipart upload repository for database operations
 */
export class MultipartUploadRepository {
  /**
   * Create a new multipart upload session
   */
  async create(options: {
    uploadId: string;
    bucket: string;
    key: string;
    userId: string;
    totalSize: number;
    totalChunks: number;
    chunkSize: number;
    expiresAt: Date;
    metadata?: Record<string, string>;
    isPublic?: boolean;
    contentType?: string;
    originalName?: string;
  }): Promise<IMultipartUpload> {
    try {
      const upload = new MultipartUpload({
        uploadId: options.uploadId,
        bucket: options.bucket,
        key: options.key,
        userId: new Types.ObjectId(options.userId),
        totalSize: options.totalSize,
        totalChunks: options.totalChunks,
        chunkSize: options.chunkSize,
        expiresAt: options.expiresAt,
        metadata: options.metadata,
        isPublic: options.isPublic || false,
        contentType: options.contentType,
        originalName: options.originalName,
        status: 'INITIATED',
      });

      return await upload.save();
    } catch (error) {
      logger.error('Failed to create multipart upload session:', { error, options });
      throw new Error(`Failed to create upload session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find multipart upload by upload ID
   */
  async findByUploadId(uploadId: string): Promise<IMultipartUpload | null> {
    try {
      return await MultipartUpload.findOne({ uploadId }).populate('userId', 'email firstName lastName');
    } catch (error) {
      logger.error('Failed to find multipart upload by ID:', { error, uploadId });
      throw new Error(`Failed to find upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find multipart uploads by user ID
   */
  async findByUserId(
    userId: string,
    options: {
      status?: MultipartUploadStatus | MultipartUploadStatus[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    uploads: IMultipartUpload[];
    total: number;
  }> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return { uploads: [], total: 0 };
      }

      const filter: Record<string, unknown> = {
        userId: new Types.ObjectId(userId),
      };

      if (options.status) {
        if (Array.isArray(options.status)) {
          filter.status = { $in: options.status };
        } else {
          filter.status = options.status;
        }
      }

      const { limit = 20, offset = 0 } = options;

      const [uploads, total] = await Promise.all([
        MultipartUpload.find(filter)
          .populate('userId', 'email firstName lastName')
          .sort({ initiatedAt: -1 })
          .skip(offset)
          .limit(limit),
        MultipartUpload.countDocuments(filter),
      ]);

      return { uploads, total };
    } catch (error) {
      logger.error('Failed to find multipart uploads by user:', { error, userId, options });
      throw new Error(`Failed to find uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add chunk to multipart upload
   */
  async addChunk(
    uploadId: string,
    chunkNumber: number,
    chunkData: {
      size: number;
      etag: string;
      hash?: string;
    }
  ): Promise<IMultipartUpload | null> {
    try {
      const upload = await MultipartUpload.findOne({ uploadId });
      
      if (!upload) {
        return null;
      }

      const chunkMetadata: IChunkMetadata = {
        chunkNumber,
        size: chunkData.size,
        etag: chunkData.etag,
        uploadedAt: new Date(),
        hash: chunkData.hash,
      };

      return await upload.addChunk(chunkNumber, chunkMetadata);
    } catch (error) {
      logger.error('Failed to add chunk to multipart upload:', { error, uploadId, chunkNumber });
      throw new Error(`Failed to add chunk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update multipart upload status
   */
  async updateStatus(uploadId: string, status: MultipartUploadStatus): Promise<IMultipartUpload | null> {
    try {
      return await MultipartUpload.findOneAndUpdate(
        { uploadId },
        { $set: { status, lastUpdatedAt: new Date() } },
        { new: true }
      ).populate('userId', 'email firstName lastName');
    } catch (error) {
      logger.error('Failed to update multipart upload status:', { error, uploadId, status });
      throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete multipart upload
   */
  async complete(uploadId: string, fileId?: string): Promise<IMultipartUpload | null> {
    try {
      const upload = await MultipartUpload.findOne({ uploadId });
      
      if (!upload) {
        return null;
      }

      return await upload.complete(fileId ? new Types.ObjectId(fileId) : undefined);
    } catch (error) {
      logger.error('Failed to complete multipart upload:', { error, uploadId, fileId });
      throw new Error(`Failed to complete upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Abort multipart upload
   */
  async abort(uploadId: string): Promise<IMultipartUpload | null> {
    try {
      const upload = await MultipartUpload.findOne({ uploadId });
      
      if (!upload) {
        return null;
      }

      return await upload.abort();
    } catch (error) {
      logger.error('Failed to abort multipart upload:', { error, uploadId });
      throw new Error(`Failed to abort upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find expired uploads
   */
  async findExpired(): Promise<IMultipartUpload[]> {
    try {
      return await MultipartUpload.find({
        status: { $in: ['INITIATED', 'IN_PROGRESS'] },
        expiresAt: { $lte: new Date() }
      });
    } catch (error) {
      logger.error('Failed to find expired uploads:', { error });
      throw new Error(`Failed to find expired uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark expired uploads
   */
  async markExpired(): Promise<number> {
    try {
      const result = await MultipartUpload.updateMany(
        {
          status: { $in: ['INITIATED', 'IN_PROGRESS'] },
          expiresAt: { $lte: new Date() }
        },
        {
          $set: {
            status: 'EXPIRED',
            lastUpdatedAt: new Date()
          }
        }
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to mark expired uploads:', { error });
      throw new Error(`Failed to mark expired uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete old completed/aborted/expired uploads
   */
  async cleanup(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await MultipartUpload.deleteMany({
        status: { $in: ['COMPLETED', 'ABORTED', 'EXPIRED', 'FAILED'] },
        lastUpdatedAt: { $lt: cutoffDate }
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old uploads:', { error, olderThanDays });
      throw new Error(`Failed to cleanup uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get upload statistics
   */
  async getStats(userId?: string): Promise<{
    totalUploads: number;
    uploadsByStatus: Record<MultipartUploadStatus, number>;
    totalSize: number;
    averageChunkSize: number;
  }> {
    try {
      const filter: Record<string, unknown> = {};

      if (userId && Types.ObjectId.isValid(userId)) {
        filter.userId = new Types.ObjectId(userId);
      }

      const [totalStats, statusStats] = await Promise.all([
        MultipartUpload.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalUploads: { $sum: 1 },
              totalSize: { $sum: '$totalSize' },
              averageChunkSize: { $avg: '$chunkSize' },
            },
          },
        ]),
        MultipartUpload.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const uploadsByStatus: Record<MultipartUploadStatus, number> = {
        INITIATED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        ABORTED: 0,
        EXPIRED: 0,
        FAILED: 0,
      };

      statusStats.forEach((stat: { _id: MultipartUploadStatus; count: number }) => {
        uploadsByStatus[stat._id] = stat.count;
      });

      return {
        totalUploads: totalStats[0]?.totalUploads || 0,
        uploadsByStatus,
        totalSize: totalStats[0]?.totalSize || 0,
        averageChunkSize: totalStats[0]?.averageChunkSize || 0,
      };
    } catch (error) {
      logger.error('Failed to get upload stats:', { error, userId });
      throw new Error(`Failed to get upload stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Multipart upload repository instance
 */
export const multipartUploadRepository = new MultipartUploadRepository();
