import bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';

import { config } from '@/config/app';
import { profileRepository } from '@/repositories/profile.repository';
import { userRepository } from '@/repositories/user.repository';
import { logger } from '@/utils/logger';

/**
 * User profile service
 */
export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    const profile = await profileRepository.findByUserId(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: profile
        ? {
            bio: profile.bio,
            avatar: profile.avatar,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            preferences: profile.preferences,
          }
        : null,
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    profileData: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      avatar?: string;
      phone?: string;
      dateOfBirth?: string;
      preferences?: {
        theme?: 'light' | 'dark';
        language?: string;
        notifications?: {
          email?: boolean;
          push?: boolean;
          sms?: boolean;
        };
      };
    }
  ) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Update user basic info
    const userUpdates: { firstName?: string; lastName?: string } = {};
    if (profileData.firstName) userUpdates.firstName = profileData.firstName;
    if (profileData.lastName) userUpdates.lastName = profileData.lastName;

    if (Object.keys(userUpdates).length > 0) {
      await userRepository.update(userId, userUpdates);
    }

    // Update profile
    const profileUpdates: {
      bio?: string | null;
      avatar?: string | null;
      phone?: string | null;
      dateOfBirth?: Date | null;
      preferences?: Record<string, unknown> | null;
    } = {};
    if (profileData.bio !== undefined) profileUpdates.bio = profileData.bio;
    if (profileData.avatar !== undefined)
      profileUpdates.avatar = profileData.avatar;
    if (profileData.phone !== undefined)
      profileUpdates.phone = profileData.phone;
    if (profileData.dateOfBirth !== undefined)
      profileUpdates.dateOfBirth = new Date(profileData.dateOfBirth);
    if (profileData.preferences !== undefined)
      profileUpdates.preferences = profileData.preferences;

    if (Object.keys(profileUpdates).length > 0) {
      await profileRepository.upsert(userId, profileUpdates);
    }

    logger.info('Profile updated', { userId });

    return this.getProfile(userId);
  },

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new HTTPException(400, {
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(
      newPassword,
      config.security.bcryptRounds
    );

    // Update password
    await userRepository.updatePassword(userId, passwordHash);

    logger.info('Password changed', { userId });
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string) {
    await profileRepository.upsert(userId, { avatar: null });

    logger.info('Avatar deleted', { userId });
  },

  /**
   * Get user activity log
   */
  async getActivity(
    _userId: string,
    query: Record<string, string | undefined>
  ) {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '10'), 100);
    // const offset = (page - 1) * limit; // TODO: Use when implementing real activity retrieval

    // TODO: Implement activity logging and retrieval
    // For now, return mock data
    return {
      activities: [
        {
          id: '1',
          type: 'login',
          description: 'User logged in',
          timestamp: new Date().toISOString(),
          metadata: {
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
          },
        },
      ],
      pagination: {
        page,
        limit,
        total: 1,
        totalPages: 1,
      },
    };
  },

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string) {
    await userRepository.update(userId, { isActive: false });

    logger.info('Account deactivated', { userId });
  },
};
