import { eq, and, or, like, desc, asc } from 'drizzle-orm';

import { db } from '@/config/database';
import { users } from '@/database/schema';
// UserRole removed - using PBAC system instead
import type { PaginationParams, FilterParams, SortParams } from '@/types';

/**
 * User repository
 */
export const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Find multiple users with pagination and filtering
   */
  async findMany(options: {
    pagination: PaginationParams;
    filters: FilterParams;
    sort: SortParams;
  }) {
    const { pagination, filters, sort } = options;

    // Build where conditions
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(users.email, `%${filters.search}%`),
          like(users.firstName, `%${filters.search}%`),
          like(users.lastName, `%${filters.search}%`)
        )
      );
    }

    // Role filtering removed - use PBAC system instead

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by
    const validSortFields = {
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    };

    const sortField =
      validSortFields[sort.field as keyof typeof validSortFields] ||
      users.createdAt;
    const orderBy = sort.order === 'desc' ? desc(sortField) : asc(sortField);

    // Get total count
    const totalResult = await db
      .select({ count: users.id })
      .from(users)
      .where(whereClause);
    const total = totalResult.length;

    // Get users
    const userResults = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return {
      users: userResults,
      total,
    };
  },

  /**
   * Create new user
   */
  async create(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
  }) {
    const result = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  },

  /**
   * Update user
   */
  async update(
    id: string,
    userData: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      emailVerified: boolean;
    }>
  ) {
    const result = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  },

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string) {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string) {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Mark email as verified
   */
  async markEmailVerified(id: string) {
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Delete user
   */
  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
  },
};
