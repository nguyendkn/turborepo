import { Document, Schema, Types, model } from 'mongoose';

/**
 * RolePolicy interface
 */
export interface IRolePolicy extends Document {
  _id: Types.ObjectId;
  roleId: Types.ObjectId;
  policyId: Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
}

/**
 * RolePolicy schema
 */
const rolePolicySchema = new Schema<IRolePolicy>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    policyId: {
      type: Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    collection: 'role_policies',
  }
);

// Indexes
rolePolicySchema.index({ roleId: 1 });
rolePolicySchema.index({ policyId: 1 });
rolePolicySchema.index({ roleId: 1, policyId: 1 }, { unique: true }); // Prevent duplicates

/**
 * RolePolicy model
 */
export const RolePolicy = model<IRolePolicy>('RolePolicy', rolePolicySchema);
