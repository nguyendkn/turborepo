import { Document, Schema, Types, model } from 'mongoose';

import type { UserPreferences } from '@/types/database';

/**
 * Profile interface
 */
export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bio?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Profile schema
 */
const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'profiles',
  }
);

// Indexes
profileSchema.index({ userId: 1 }, { unique: true });

/**
 * Profile model
 */
export const Profile = model<IProfile>('Profile', profileSchema);
