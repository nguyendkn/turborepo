import { Schema, model, Document, Types } from 'mongoose';

/**
 * RefreshToken interface
 */
export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenId: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * RefreshToken schema
 */
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      required: true,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    collection: 'refresh_tokens',
  }
);

// Indexes
refreshTokenSchema.index({ tokenId: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 });
refreshTokenSchema.index({ isRevoked: 1 });

/**
 * RefreshToken model
 */
export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
