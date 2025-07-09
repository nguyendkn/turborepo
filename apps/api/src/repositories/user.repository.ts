import { User, type IUser } from '@/database/models';
import type { PaginationParams, UserFilterParams, SortParams } from '@/types';
import type { UserFilterConditions, MongoSortOptions } from '@/types/database';

/**
 * User repository
 */
export const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Find multiple users with pagination and filtering
   */
  async findMany(options: {
    pagination: PaginationParams;
    filters: UserFilterParams;
    sort: SortParams;
  }) {
    const { pagination, filters, sort } = options;

    // Build filter conditions
    const filterConditions: UserFilterConditions = {};

    if (filters.search) {
      filterConditions.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.isActive !== undefined) {
      filterConditions.isActive = filters.isActive;
    }

    if (filters.emailVerified !== undefined) {
      filterConditions.emailVerified = filters.emailVerified;
    }

    // Build sort options
    const sortField = sort.field || 'createdAt';
    const sortDirection = sort.order === 'asc' ? 1 : -1;
    const sortOptions: MongoSortOptions = {};
    sortOptions[sortField] = sortDirection;

    // Get total count
    const total = await User.countDocuments(filterConditions);

    // Get users with pagination
    const users = await User.find(filterConditions)
      .sort(sortOptions)
      .limit(pagination.limit)
      .skip(pagination.offset);

    return {
      users,
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
  }): Promise<IUser> {
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    return await user.save();
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
  ): Promise<IUser | null> {
    try {
      const updateData = { ...userData };
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return user;
    } catch {
      return null;
    }
  },

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await User.findByIdAndUpdate(id, { passwordHash });
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  },

  /**
   * Mark email as verified
   */
  async markEmailVerified(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  },
};
