import { Schema, model, Document, Types } from 'mongoose';
import type { RoleMetadata } from '@/types/database';

/**
 * Role interface
 */
export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  metadata?: RoleMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
}

/**
 * Role schema
 */
const roleSchema = new Schema<IRole>(
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
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isSystemRole: {
      type: Boolean,
      required: true,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });

/**
 * Role model
 */
export const Role = model<IRole>('Role', roleSchema);
