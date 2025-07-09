import { Schema, model, Document, Types } from 'mongoose';
import type { ActivityLogMetadata } from '@/types/database';

/**
 * ActivityLog interface
 */
export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  type: string;
  description: string;
  metadata?: ActivityLogMetadata;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * ActivityLog schema
 */
const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    collection: 'activity_logs',
  }
);

// Indexes
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ type: 1 });
activityLogSchema.index({ createdAt: 1 });

/**
 * ActivityLog model
 */
export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
