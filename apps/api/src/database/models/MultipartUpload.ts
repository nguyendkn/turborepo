import { Document, Model, Schema, Types, model } from 'mongoose';

import type { MultipartUploadStatus } from '@/types/storage';

/**
 * Chunk metadata interface
 */
export interface IChunkMetadata {
  chunkNumber: number;
  size: number;
  etag: string;
  uploadedAt: Date;
  hash?: string | undefined;
}

/**
 * Multipart upload interface extending Mongoose Document
 */
export interface IMultipartUpload extends Document {
  _id: Types.ObjectId;
  uploadId: string;
  bucket: string;
  key: string;
  userId: Types.ObjectId;
  totalSize: number;
  totalChunks: number;
  chunkSize: number;
  uploadedChunks: Map<number, IChunkMetadata>;
  status: MultipartUploadStatus;
  initiatedAt: Date;
  lastUpdatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  abortedAt?: Date;
  metadata?: Record<string, string>;
  isPublic: boolean;
  contentType?: string;
  originalName?: string;
  fileId?: Types.ObjectId; // Reference to File model when completed

  // Instance methods
  addChunk(chunkNumber: number, chunkData: IChunkMetadata): Promise<IMultipartUpload>;
  complete(fileId?: Types.ObjectId): Promise<IMultipartUpload>;
  abort(): Promise<IMultipartUpload>;
  expire(): Promise<IMultipartUpload>;
}

/**
 * Multipart upload model interface with static methods
 */
export interface IMultipartUploadModel extends Model<IMultipartUpload> {
  findActive(filter?: Record<string, unknown>): ReturnType<Model<IMultipartUpload>['find']>;
  findExpired(): ReturnType<Model<IMultipartUpload>['find']>;
  findByUser(userId: string | Types.ObjectId, filter?: Record<string, unknown>): ReturnType<Model<IMultipartUpload>['find']>;
}

/**
 * Chunk metadata schema
 */
const chunkMetadataSchema = new Schema<IChunkMetadata>({
  chunkNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  etag: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  hash: {
    type: String,
    trim: true,
    default: undefined,
  },
}, { _id: false });

/**
 * Multipart upload schema definition
 */
const multipartUploadSchema = new Schema<IMultipartUpload>(
  {
    uploadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bucket: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalSize: {
      type: Number,
      required: true,
      min: 0,
    },
    totalChunks: {
      type: Number,
      required: true,
      min: 1,
    },
    chunkSize: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadedChunks: {
      type: Map,
      of: chunkMetadataSchema,
      default: new Map(),
    },
    status: {
      type: String,
      enum: ['INITIATED', 'IN_PROGRESS', 'COMPLETED', 'ABORTED', 'EXPIRED', 'FAILED'],
      default: 'INITIATED',
      required: true,
    },
    initiatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
    abortedAt: {
      type: Date,
      default: undefined,
    },
    metadata: {
      type: Map,
      of: String,
      default: undefined,
    },
    isPublic: {
      type: Boolean,
      default: false,
      required: true,
    },
    contentType: {
      type: String,
      trim: true,
      default: undefined,
    },
    originalName: {
      type: String,
      trim: true,
      default: undefined,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      default: undefined,
    },
  },
  {
    timestamps: { createdAt: 'initiatedAt', updatedAt: 'lastUpdatedAt' },
    collection: 'multipart_uploads',
  }
);

// Indexes for performance
multipartUploadSchema.index({ userId: 1, status: 1 });
multipartUploadSchema.index({ bucket: 1, key: 1 });
multipartUploadSchema.index({ status: 1 });
multipartUploadSchema.index({ expiresAt: 1 });
multipartUploadSchema.index({ initiatedAt: 1 });

// Compound indexes for common queries
multipartUploadSchema.index({ userId: 1, initiatedAt: -1 });
multipartUploadSchema.index({ status: 1, expiresAt: 1 });

// Virtual for upload progress percentage
multipartUploadSchema.virtual('progressPercentage').get(function(this: IMultipartUpload) {
  if (this.totalChunks === 0) return 0;
  return Math.round((this.uploadedChunks.size / this.totalChunks) * 100);
});

// Virtual for uploaded size
multipartUploadSchema.virtual('uploadedSize').get(function(this: IMultipartUpload) {
  let totalSize = 0;
  for (const chunk of this.uploadedChunks.values()) {
    totalSize += chunk.size;
  }
  return totalSize;
});

// Pre-save middleware to update lastUpdatedAt
multipartUploadSchema.pre('save', function(this: IMultipartUpload, next) {
  this.lastUpdatedAt = new Date();
  next();
});

// Static method to find active uploads
multipartUploadSchema.statics.findActive = function(filter = {}) {
  return this.find({
    ...filter,
    status: { $in: ['INITIATED', 'IN_PROGRESS'] },
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find expired uploads
multipartUploadSchema.statics.findExpired = function() {
  return this.find({
    status: { $in: ['INITIATED', 'IN_PROGRESS'] },
    expiresAt: { $lte: new Date() }
  });
};

// Static method to find uploads by user
multipartUploadSchema.statics.findByUser = function(userId: string | Types.ObjectId, filter = {}) {
  return this.find({
    ...filter,
    userId: new Types.ObjectId(userId)
  });
};

// Instance method to add chunk
multipartUploadSchema.methods.addChunk = function(
  this: IMultipartUpload,
  chunkNumber: number,
  chunkData: IChunkMetadata
) {
  this.uploadedChunks.set(chunkNumber, chunkData);

  // Update status to IN_PROGRESS if this is the first chunk
  if (this.status === 'INITIATED') {
    this.status = 'IN_PROGRESS';
  }

  return this.save();
};

// Instance method to complete upload
multipartUploadSchema.methods.complete = function(this: IMultipartUpload, fileId?: Types.ObjectId) {
  this.status = 'COMPLETED';
  this.completedAt = new Date();
  if (fileId) {
    this.fileId = fileId;
  }
  return this.save();
};

// Instance method to abort upload
multipartUploadSchema.methods.abort = function(this: IMultipartUpload) {
  this.status = 'ABORTED';
  this.abortedAt = new Date();
  return this.save();
};

// Instance method to mark as expired
multipartUploadSchema.methods.expire = function(this: IMultipartUpload) {
  this.status = 'EXPIRED';
  return this.save();
};

/**
 * Multipart upload model
 */
export const MultipartUpload = model<IMultipartUpload, IMultipartUploadModel>('MultipartUpload', multipartUploadSchema);
