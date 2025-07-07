import bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';

import { config } from '@/config/app';
import { userRepository } from '@/repositories/user.repository';
import { UserRole } from '@/types/app';
import type { PaginationParams, FilterParams, SortParams } from '@/types/app';
import { logger } from '@/utils/logger';
import { generateRandomPassword } from '@/utils/password';

/**
 * User management service
 */
export const userService = {
  /**
   * Get all users with pagination and filtering
   */
  async getUsers(query: Record<string, string | undefined>) {
    const pagination: PaginationParams = {
      page: parseInt(query.page || '1'),
      limit: Math.min(parseInt(query.limit || '10'), 100),
      offset: 0,
    };
    pagination.offset = (pagination.page - 1) * pagination.limit;

    const filters: FilterParams = {};
    if (query.search) filters.search = query.search;
    if (query.role) filters.role = query.role as UserRole;
    if (query.isActive === 'true') {
      filters.isActive = true;
    } else if (query.isActive === 'false') {
      filters.isActive = false;
    }

    const sort: SortParams = {
      field: query.sortBy || 'createdAt',
      order: (query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await userRepository.findMany({
      pagination,
      filters,
      sort,
    });

    return {
      users: result.users.map(user => ({
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
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    };
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      return null;
    }

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
    };
  },

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    isActive?: boolean;
  }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new HTTPException(409, { message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      userData.password,
      config.security.bcryptRounds
    );

    // Create user
    const user = await userRepository.create({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || UserRole.USER,
      isActive: userData.isActive ?? true,
      emailVerified: false,
    });

    if (!user) {
      throw new HTTPException(500, { message: 'Failed to create user' });
    }

    logger.info('User created', { userId: user.id, email: user.email });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Update user
   */
  async updateUser(
    id: string,
    userData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      isActive?: boolean;
    }
  ) {
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return null;
    }

    // Check if email is being changed and if it's already taken
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new HTTPException(409, { message: 'Email already exists' });
      }
    }

    const user = await userRepository.update(id, userData);

    if (!user) {
      throw new HTTPException(500, { message: 'Failed to update user' });
    }

    logger.info('User updated', { userId: id });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      return false;
    }

    await userRepository.delete(id);

    logger.info('User deleted', { userId: id });

    return true;
  },

  /**
   * Activate user account
   */
  async activateUser(id: string) {
    const user = await userRepository.update(id, { isActive: true });

    if (!user) {
      return null;
    }

    logger.info('User activated', { userId: id });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Deactivate user account
   */
  async deactivateUser(id: string) {
    const user = await userRepository.update(id, { isActive: false });

    if (!user) {
      return null;
    }

    logger.info('User deactivated', { userId: id });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Reset user password
   */
  async resetUserPassword(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Generate temporary password
    const temporaryPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      config.security.bcryptRounds
    );

    // Update password
    await userRepository.updatePassword(id, passwordHash);

    logger.info('User password reset', { userId: id });

    return temporaryPassword;
  },
};
