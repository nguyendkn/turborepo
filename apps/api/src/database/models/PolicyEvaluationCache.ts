import { Schema, model, Document, Types } from 'mongoose';

/**
 * PolicyEvaluationCache interface
 */
export interface IPolicyEvaluationCache extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  cacheKey: string;
  result: boolean;
  createdAt: Date;
}

/**
 * PolicyEvaluationCache schema
 */
const policyEvaluationCacheSchema = new Schema<IPolicyEvaluationCache>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cacheKey: {
      type: String,
      required: true,
    },
    result: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    collection: 'policy_evaluation_cache',
  }
);

// Indexes
policyEvaluationCacheSchema.index({ userId: 1, cacheKey: 1 }, { unique: true });
policyEvaluationCacheSchema.index({ createdAt: 1 });

/**
 * PolicyEvaluationCache model
 */
export const PolicyEvaluationCache = model<IPolicyEvaluationCache>(
  'PolicyEvaluationCache',
  policyEvaluationCacheSchema
);
