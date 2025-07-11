import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { storageController } from '@/controllers/storage.controller';

/**
 * Storage routes
 */
const storage = new Hono();

/**
 * File upload validation schema
 */
const uploadQuerySchema = z.object({
  bucket: z.string().optional(),
  key: z.string().optional(),
  isPublic: z.string().optional(),
});

/**
 * File list query schema
 */
const listQuerySchema = z.object({
  bucket: z.string().optional(),
  prefix: z.string().optional(),
  maxKeys: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(1000))
    .optional(),
  recursive: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

/**
 * Presigned URL body schema
 */
const presignedUrlBodySchema = z.object({
  bucket: z.string().optional(),
  key: z.string().min(1),
  expiresIn: z.number().int().min(60).max(604800).optional(),
  method: z.enum(['GET', 'PUT', 'DELETE']).optional(),
});

/**
 * Bucket creation body schema
 */
const bucketCreationBodySchema = z.object({
  name: z.string().min(3).max(63),
  region: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// File operations
storage.post(
  '/upload',
  zValidator('query', uploadQuerySchema),
  storageController.uploadFile
);

storage.get('/download/:bucket/:key', storageController.downloadFile);
storage.get('/download/:key', storageController.downloadFile);

storage.get('/metadata/:bucket/:key', storageController.getFileMetadata);
storage.get('/metadata/:key', storageController.getFileMetadata);

storage.delete('/file/:bucket/:key', storageController.deleteFile);
storage.delete('/file/:key', storageController.deleteFile);

storage.get(
  '/list',
  zValidator('query', listQuerySchema),
  storageController.listFiles
);

// URL generation
storage.post(
  '/presigned-url',
  zValidator('json', presignedUrlBodySchema),
  storageController.getPresignedUrl
);

// Bucket operations
storage.post(
  '/bucket',
  zValidator('json', bucketCreationBodySchema),
  storageController.createBucket
);

storage.get('/buckets', storageController.listBuckets);
storage.get('/bucket/:bucket', storageController.getBucketInfo);
storage.delete('/bucket/:bucket', storageController.deleteBucket);

export { storage };
