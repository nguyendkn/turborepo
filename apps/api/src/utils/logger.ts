import winston from 'winston';

import { config } from '@/config/app';

/**
 * Custom log format for development
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

/**
 * Production log format
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.env === 'development' ? developmentFormat : productionFormat,
  defaultMeta: {
    service: 'csmart-api',
    environment: config.env,
  },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

// Add file transport for production
if (config.env === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Create child logger with additional context
 */
export function createChildLogger(
  context: Record<string, unknown>
): winston.Logger {
  return logger.child(context);
}

/**
 * Log request information
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  userAgent?: string,
  ip?: string
): void {
  const logData = {
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent,
    ip,
  };

  if (statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
}

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
}
