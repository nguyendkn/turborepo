import { Schema, model, Document, Types } from 'mongoose';

/**
 * UserRole interface
 */
export interface IUserRole extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  assignedAt: Date;
  assignedBy?: Types.ObjectId;
  expiresAt?: Date;
}

/**
 * UserRole schema
 */
const userRoleSchema = new Schema<IUserRole>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false, // Using custom assignedAt field
    collection: 'user_roles',
  }
);

// Indexes
userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true }); // Prevent duplicates
userRoleSchema.index({ expiresAt: 1 });

/**
 * UserRole model
 */
export const UserRole = model<IUserRole>('UserRole', userRoleSchema);
