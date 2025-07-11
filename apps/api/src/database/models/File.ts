import { Document, model, Model, Schema, Types } from 'mongoose';

import type { FileStatus } from '@/types/storage';

/**
 * File interface extending Mongoose Document
 */
export interface IFile extends Document {
  _id: Types.ObjectId;
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  bucket: string;
  key: string;
  userId: Types.ObjectId;
  status: FileStatus;
  isPublic: boolean;
  metadata?: Record<string, string>;
  fileHash?: string;
  uploadId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;

  // Instance methods
  softDelete(): Promise<IFile>;
  restore(): Promise<IFile>;
}

/**
 * File model interface with static methods
 */
export interface IFileModel extends Model<IFile> {
  findActive(filter?: Record<string, unknown>): ReturnType<Model<IFile>['find']>;
  findByUser(userId: string | Types.ObjectId, filter?: Record<string, unknown>): ReturnType<Model<IFile>['find']>;
}

/**
 * File schema definition
 */
const fileSchema = new Schema<IFile>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    status: {
      type: String,
      enum: ['UPLOADING', 'COMPLETED', 'FAILED', 'DELETED', 'PROCESSING'],
      default: 'UPLOADING',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      required: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: undefined,
    },
    fileHash: {
      type: String,
      trim: true,
      default: undefined,
    },
    uploadId: {
      type: String,
      trim: true,
      default: undefined,
    },
    deletedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'files',
  }
);

// Indexes for performance
fileSchema.index({ userId: 1, status: 1 });
fileSchema.index({ bucket: 1, key: 1 }, { unique: true });
fileSchema.index({ status: 1 });
fileSchema.index({ createdAt: 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ uploadId: 1 });
fileSchema.index({ deletedAt: 1 });

// Compound indexes for common queries
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, status: 1, createdAt: -1 });
fileSchema.index({ bucket: 1, status: 1 });

// Text index for search functionality
fileSchema.index(
  {
    originalName: 'text',
    fileName: 'text',
  },
  {
    weights: {
      originalName: 10,
      fileName: 5,
    },
    name: 'file_text_index',
  }
);

// Virtual for file URL (can be computed based on bucket and key)
fileSchema.virtual('url').get(function (this: IFile) {
  if (this.isPublic) {
    // Return public URL format
    return `/api/v1/storage/public/${this.bucket}/${this.key}`;
  }
  // Return private URL format
  return `/api/v1/storage/private/${this._id}`;
});

// Virtual for file extension
fileSchema.virtual('extension').get(function (this: IFile) {
  const lastDotIndex = this.originalName.lastIndexOf('.');
  return lastDotIndex !== -1
    ? this.originalName.substring(lastDotIndex + 1).toLowerCase()
    : '';
});

// Virtual for human readable size
fileSchema.virtual('humanSize').get(function (this: IFile) {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware to ensure consistent data
fileSchema.pre('save', function (this: IFile, next) {
  // Ensure fileName is set if not provided
  if (!this.fileName && this.originalName) {
    this.fileName = this.originalName;
  }

  // Ensure filePath is set if not provided
  if (!this.filePath && this.key) {
    this.filePath = this.key;
  }

  next();
});

// Static method to find non-deleted files
fileSchema.statics.findActive = function (filter = {}) {
  return this.find({
    ...filter,
    deletedAt: { $exists: false },
  });
};

// Static method to find files by user
fileSchema.statics.findByUser = function (
  userId: string | Types.ObjectId,
  filter = {}
) {
  return (this as IFileModel).findActive({
    ...filter,
    userId: new Types.ObjectId(userId),
  });
};

// Instance method to soft delete
fileSchema.methods.softDelete = function (this: IFile) {
  this.deletedAt = new Date();
  this.status = 'DELETED';
  return this.save();
};

// Instance method to restore from soft delete
fileSchema.methods.restore = function (this: IFile) {
  this.deletedAt = undefined;
  if (this.status === 'DELETED') {
    this.status = 'COMPLETED';
  }
  return this.save();
};

/**
 * File model
 */
export const File = model<IFile, IFileModel>('File', fileSchema);
