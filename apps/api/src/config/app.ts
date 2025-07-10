import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment validation schema
 */
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('3000'),
  HOST: z.string().default('localhost'),

  // Database configuration (MongoDB)
  DATABASE_URI: z.string().optional(), // MongoDB connection string
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('27017'), // MongoDB default port
  DB_NAME: z.string().default('csmart'),
  DB_USER: z.string().default(''),
  DB_PASSWORD: z.string().default(''),

  // Redis configuration
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).pipe(z.number().min(0)).default('0'),

  // JWT configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS configuration
  CORS_ORIGINS: z.string().default('*'),
  CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_HEADERS: z.string().default('Content-Type,Authorization'),
  CORS_CREDENTIALS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('100'),

  // Email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // File upload
  MAX_FILE_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

  // Security
  BCRYPT_ROUNDS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(8).max(15))
    .default('12'),

  // API Documentation
  API_DOCS_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
});

/**
 * Validate and parse environment variables
 */
const env = envSchema.parse(process.env);

/**
 * Application configuration
 */
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,

  database: {
    uri: env.DATABASE_URI
  },

  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    origins: env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
    methods: env.CORS_METHODS.split(',').map(method => method.trim()),
    headers: env.CORS_HEADERS.split(',').map(header => header.trim()),
    credentials: env.CORS_CREDENTIALS,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM,
  },

  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadDir: env.UPLOAD_DIR,
  },

  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },

  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },

  docs: {
    enabled: env.API_DOCS_ENABLED,
  },
} as const;

export type Config = typeof config;
