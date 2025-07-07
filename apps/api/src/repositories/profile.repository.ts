import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { profiles } from '@/database/schema';

/**
 * Profile repository
 */
export const profileRepository = {
  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string) {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return result[0] || null;
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
      preferences: Record<string, unknown> | null;
    }>
  ) {
    const existing = await this.findByUserId(userId);

    if (existing) {
      // Update existing profile
      const result = await db
        .update(profiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();

      return result[0];
    } else {
      // Create new profile
      const result = await db
        .insert(profiles)
        .values({
          userId,
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return result[0];
    }
  },

  /**
   * Delete profile
   */
  async delete(userId: string) {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  },
};
