import bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';
import * as jwt from 'jsonwebtoken';

import { config } from '@/config/app';
import { userRepository } from '@/repositories/user.repository';
import { roleService } from '@/services/role.service';
import { permissionEvaluatorService } from '@/services/permission-evaluator.service';
import type { JwtPayload, RefreshTokenPayload } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Authentication service
 */
export const authService = {
  /**
   * User login
   */
  async login(email: string, password: string) {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      throw new HTTPException(401, { message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email
    );

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Get user roles for response
    const userRoles = await permissionEvaluatorService.getUserRoles(user.id);

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles,
        isActive: user.isActive,
      },
      ...tokens,
    };
  },

  /**
   * User registration
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
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
      ...userData,
      passwordHash,
      // Role assignment handled by PBAC system
      isActive: true,
      emailVerified: false,
    });

    if (!user) {
      throw new HTTPException(500, { message: 'Failed to create user' });
    }

    // Assign default user role in PBAC system
    await roleService.assignRoleToUser(user.id, 'user');

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email
    );

    logger.info('User registered', { userId: user.id, email: user.email });

    // Get user roles for response
    const userRoles = await permissionEvaluatorService.getUserRoles(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles,
        isActive: user.isActive,
      },
      ...tokens,
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as RefreshTokenPayload;

      // Find user
      const user = await userRepository.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new HTTPException(401, { message: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        user.id,
        user.email
      );

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HTTPException(401, { message: 'Invalid refresh token' });
      }
      throw error;
    }
  },

  /**
   * User logout
   */
  async logout(userId: string) {
    // TODO: Implement token blacklisting if needed
    logger.info('User logged out', { userId });
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    jwt.sign({ sub: user.id, type: 'password_reset' }, config.jwt.secret, {
      expiresIn: '1h',
    });

    // TODO: Send email with reset token
    logger.info('Password reset requested', { userId: user.id, email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        type: string;
        userId: string;
        sub: string;
        exp: number;
      };

      if (payload.type !== 'password_reset') {
        throw new HTTPException(400, { message: 'Invalid reset token' });
      }

      const user = await userRepository.findById(payload.sub);

      if (!user) {
        throw new HTTPException(400, { message: 'Invalid reset token' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(
        newPassword,
        config.security.bcryptRounds
      );

      // Update password
      await userRepository.updatePassword(user.id, passwordHash);

      logger.info('Password reset completed', { userId: user.id });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HTTPException(400, {
          message: 'Invalid or expired reset token',
        });
      }
      throw error;
    }
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        type: string;
        userId: string;
        sub: string;
        exp: number;
      };

      if (payload.type !== 'email_verification') {
        throw new HTTPException(400, { message: 'Invalid verification token' });
      }

      const user = await userRepository.findById(payload.sub);

      if (!user) {
        throw new HTTPException(400, { message: 'Invalid verification token' });
      }

      // Mark email as verified
      await userRepository.markEmailVerified(user.id);

      logger.info('Email verified', { userId: user.id });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HTTPException(400, {
          message: 'Invalid or expired verification token',
        });
      }
      throw error;
    }
  },

  /**
   * Generate JWT tokens
   */
  async generateTokens(userId: string, email: string) {
    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshTokenPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: userId,
      tokenId: `${userId}_${Date.now()}`,
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
      } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  },
};
