import { Profile, type IProfile } from '@/database/models';
import type { UserPreferences } from '@/types/database';

/**
 * Profile repository
 */
export const profileRepository = {
  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string): Promise<IProfile | null> {
    try {
      const profile = await Profile.findOne({ userId });
      return profile;
    } catch {
      return null;
    }
  },

  /**
   * Create or update profile
   */
  async upsert(
    userId: string,
    profileData: Partial<{
      bio: string | null;
      avatar: string | null;
      phone: string | null;
      dateOfBirth: Date | null;
      preferences: UserPreferences | null;
    }>
  ): Promise<IProfile> {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { ...profileData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return profile;
  },

  /**
   * Delete profile
   */
  async delete(userId: string): Promise<void> {
    await Profile.findOneAndDelete({ userId });
  },
};
