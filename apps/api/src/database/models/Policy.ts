import { Schema, model, Document, Types } from 'mongoose';
import type { PolicyConditions } from '@/types/policy';

/**
 * Policy interface
 */
export interface IPolicy extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  conditions: PolicyConditions;
  actions: string[];
  resources: string[];
  effect: 'allow' | 'deny';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
}

/**
 * Policy schema
 */
const policySchema = new Schema<IPolicy>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    conditions: {
      type: Schema.Types.Mixed,
      required: true,
    },
    actions: {
      type: [String],
      required: true,
    },
    resources: {
      type: [String],
      required: true,
    },
    effect: {
      type: String,
      required: true,
      enum: ['allow', 'deny'],
      default: 'allow',
    },
    priority: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'policies',
  }
);

// Indexes
policySchema.index({ name: 1 }, { unique: true });
policySchema.index({ isActive: 1 });
policySchema.index({ priority: 1 });

/**
 * Policy model
 */
export const Policy = model<IPolicy>('Policy', policySchema);
