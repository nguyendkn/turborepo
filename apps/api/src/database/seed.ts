import bcrypt from 'bcryptjs';

import { config } from '@/config/app';
import { Policy, Role, RolePolicy, User, UserRole } from '@/database/models';
import { logger } from '@/utils/logger';

/**
 * Database seeding utilities
 */
export const databaseSeed = {
  /**
   * Seed database with initial data
   */
  seed: async () => {
    logger.info('Starting database seeding...');

    if (!config.admin.enableSeeding) {
      logger.info('Admin seeding is disabled');
      return;
    }

    try {
      // Seed admin policies first
      await seedAdminPolicies();

      // Seed admin role
      await seedAdminRole();

      // Seed admin user
      await seedAdminUser();

      logger.info('Database seeding completed successfully');
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    }
  },
};

/**
 * Seed admin policies for full system access
 */
async function seedAdminPolicies(): Promise<void> {
  logger.info('Seeding admin policies...');

  const adminPolicies = [
    {
      name: 'Admin Full Access',
      description: 'Full administrative access to all resources',
      version: 1,
      isActive: true,
      conditions: {},
      actions: ['*'],
      resources: ['*'],
      effect: 'allow' as const,
      priority: 1000,
    },
    {
      name: 'User Management',
      description: 'Full access to user management',
      version: 1,
      isActive: true,
      conditions: {},
      actions: ['create', 'read', 'update', 'delete'],
      resources: ['users', 'profiles'],
      effect: 'allow' as const,
      priority: 900,
    },
    {
      name: 'Role Management',
      description: 'Full access to role and permission management',
      version: 1,
      isActive: true,
      conditions: {},
      actions: ['create', 'read', 'update', 'delete'],
      resources: ['roles', 'policies', 'permissions'],
      effect: 'allow' as const,
      priority: 900,
    },
    {
      name: 'System Management',
      description: 'Access to system configuration and monitoring',
      version: 1,
      isActive: true,
      conditions: {},
      actions: ['create', 'read', 'update', 'delete'],
      resources: ['system', 'logs', 'metrics', 'storage'],
      effect: 'allow' as const,
      priority: 900,
    },
  ];

  for (const policyData of adminPolicies) {
    const existingPolicy = await Policy.findOne({ name: policyData.name });

    if (!existingPolicy) {
      const policy = new Policy(policyData);
      await policy.save();
      logger.info(`Created admin policy: ${policyData.name}`);
    } else {
      logger.debug(`Admin policy already exists: ${policyData.name}`);
    }
  }
}

/**
 * Seed admin role with all admin policies
 */
async function seedAdminRole(): Promise<void> {
  logger.info('Seeding admin role...');

  const adminRoleName = 'Administrator';
  let adminRole = await Role.findOne({ name: adminRoleName });

  if (!adminRole) {
    adminRole = new Role({
      name: adminRoleName,
      description: 'System administrator with full access to all resources',
      isActive: true,
      isSystemRole: true,
      metadata: {
        level: 'system',
        permissions: ['*'],
      },
    });

    await adminRole.save();
    logger.info(`Created admin role: ${adminRoleName}`);
  } else {
    logger.debug(`Admin role already exists: ${adminRoleName}`);
  }

  // Assign all admin policies to the admin role
  const adminPolicies = await Policy.find({
    name: {
      $in: [
        'Admin Full Access',
        'User Management',
        'Role Management',
        'System Management',
      ],
    },
  });

  for (const policy of adminPolicies) {
    const existingRolePolicy = await RolePolicy.findOne({
      roleId: adminRole._id,
      policyId: policy._id,
    });

    if (!existingRolePolicy) {
      const rolePolicy = new RolePolicy({
        roleId: adminRole._id,
        policyId: policy._id,
        assignedAt: new Date(),
      });

      await rolePolicy.save();
      logger.info(`Assigned policy "${policy.name}" to admin role`);
    } else {
      logger.debug(`Policy "${policy.name}" already assigned to admin role`);
    }
  }
}

/**
 * Seed admin user with admin role
 */
async function seedAdminUser(): Promise<void> {
  logger.info('Seeding admin user...');

  const adminEmail = config.admin.email;
  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    // Hash the admin password
    const passwordHash = await bcrypt.hash(
      config.admin.password,
      config.security.bcryptRounds
    );

    adminUser = new User({
      email: adminEmail,
      passwordHash,
      firstName: config.admin.firstName,
      lastName: config.admin.lastName,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    await adminUser.save();
    logger.info(`Created admin user: ${adminEmail}`);
  } else {
    logger.debug(`Admin user already exists: ${adminEmail}`);
  }

  // Assign admin role to the admin user
  const adminRole = await Role.findOne({ name: 'Administrator' });

  if (adminRole) {
    const existingUserRole = await UserRole.findOne({
      userId: adminUser._id,
      roleId: adminRole._id,
    });

    if (!existingUserRole) {
      const userRole = new UserRole({
        userId: adminUser._id,
        roleId: adminRole._id,
        assignedAt: new Date(),
      });

      await userRole.save();
      logger.info(`Assigned admin role to user: ${adminEmail}`);
    } else {
      logger.debug(`Admin role already assigned to user: ${adminEmail}`);
    }
  } else {
    logger.error('Admin role not found when trying to assign to admin user');
  }
}
