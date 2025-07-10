import { Schema, model, Document, Types } from 'mongoose';

/**
 * User interface
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users',
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

/**
 * User model
 */
export const User = model<IUser>('User', userSchema);
