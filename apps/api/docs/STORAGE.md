# MinIO Storage Integration

This document describes the MinIO storage integration for the CSmart API application.

## Overview

The storage integration provides a complete solution for file management using MinIO as the object storage backend. It includes:

- **Storage Service**: Core file operations (upload, download, delete, list)
- **Bucket Management**: Bucket creation, policy management, and utilities
- **Type Safety**: Comprehensive TypeScript interfaces and types
- **Error Handling**: Proper error handling with custom error types
- **Integration Tests**: Complete test suite for validation

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=39000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false
MINIO_REGION=us-east-1
MINIO_DEFAULT_BUCKET=uploads
```

### Docker Compose

MinIO is already configured in `docker-compose.env.yml`:

```yaml
minio:
  image: minio/minio:latest
  container_name: turbo-minio
  restart: unless-stopped
  ports:
    - "39000:9000"    # API port
    - "39001:9001"    # Console port
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
    MINIO_REGION: us-east-1
  volumes:
    - ./data/minio:/data
  command: server /data --console-address ":9001"
```

## Usage

### Basic File Operations

```typescript
import { storageService } from '@/services/storage.service';

// Upload a file
const uploadResult = await storageService.uploadFile(fileBuffer, {
  bucket: 'my-bucket',
  key: 'path/to/file.txt',
  contentType: 'text/plain',
  metadata: { 'uploaded-by': 'user-123' },
  size: fileBuffer.length,
});

// Download a file
const fileStream = await storageService.downloadFile({
  bucket: 'my-bucket',
  key: 'path/to/file.txt',
});

// Get file metadata
const metadata = await storageService.getFileMetadata('my-bucket', 'path/to/file.txt');

// Delete a file
await storageService.deleteFile({
  bucket: 'my-bucket',
  key: 'path/to/file.txt',
});

// List files
const fileList = await storageService.listFiles({
  bucket: 'my-bucket',
  prefix: 'path/',
  maxKeys: 100,
});
```

### Bucket Management

```typescript
import { bucketManager } from '@/utils/bucket-manager';

// Create a bucket
const bucketInfo = await bucketManager.createBucket({
  name: 'my-new-bucket',
  region: 'us-east-1',
  isPublic: false,
});

// Check if bucket is public
const isPublic = await bucketManager.isBucketPublic('my-bucket');

// Generate file URL (public or presigned based on bucket policy)
const fileUrl = await bucketManager.generateFileUrl('my-bucket', 'file.txt', 3600);

// Set bucket policy
await bucketManager.setBucketPolicy('my-bucket', 'PUBLIC_READ');
```

### Presigned URLs

```typescript
// Generate presigned URL for file access
const downloadUrl = await storageService.getPresignedUrl({
  bucket: 'my-bucket',
  key: 'file.txt',
  expiresIn: 3600, // 1 hour
  method: 'GET',
});

// Generate presigned URL for file upload
const uploadUrl = await storageService.getPresignedUrl({
  bucket: 'my-bucket',
  key: 'new-file.txt',
  expiresIn: 3600,
  method: 'PUT',
});
```

## API Endpoints

### File Operations

- `POST /api/v1/storage/upload` - Upload a file
- `GET /api/v1/storage/download/:bucket/:key` - Download a file
- `GET /api/v1/storage/download/:key` - Download from default bucket
- `GET /api/v1/storage/metadata/:bucket/:key` - Get file metadata
- `DELETE /api/v1/storage/file/:bucket/:key` - Delete a file
- `GET /api/v1/storage/list` - List files in bucket

### URL Generation

- `POST /api/v1/storage/presigned-url` - Generate presigned URL

### Bucket Operations

- `POST /api/v1/storage/bucket` - Create a bucket
- `GET /api/v1/storage/buckets` - List all buckets
- `GET /api/v1/storage/bucket/:bucket` - Get bucket information
- `DELETE /api/v1/storage/bucket/:bucket` - Delete a bucket

## Testing

### Manual Testing

Run the storage test script:

```bash
# Test storage operations manually
bun run storage:test
```

### Integration Tests

Run the integration test suite:

```bash
# Run storage integration tests
bun run test:storage

# Run tests in watch mode
bun run test:storage:watch
```

### Test Coverage

The integration tests cover:

- File upload/download operations
- File metadata retrieval
- File deletion
- File listing with filters
- Presigned URL generation
- Bucket creation and management
- Error handling scenarios

## Error Handling

The storage service uses custom error types for better error handling:

```typescript
import type { StorageError } from '@/types/storage';

try {
  await storageService.downloadFile({ bucket: 'my-bucket', key: 'file.txt' });
} catch (error) {
  const storageError = error as StorageError;
  
  switch (storageError.type) {
    case 'FILE_NOT_FOUND':
      // Handle file not found
      break;
    case 'BUCKET_NOT_FOUND':
      // Handle bucket not found
      break;
    case 'ACCESS_DENIED':
      // Handle access denied
      break;
    default:
      // Handle other errors
      break;
  }
}
```

## Security Considerations

### Bucket Policies

- **Private buckets**: Default configuration, requires authentication
- **Public buckets**: Allow public read access to files
- **Custom policies**: Fine-grained access control

### File Access

- Use presigned URLs for temporary access to private files
- Set appropriate expiration times for presigned URLs
- Validate file types and sizes before upload
- Implement proper authentication and authorization

### Best Practices

1. **Use descriptive bucket names** following naming conventions
2. **Organize files with logical key structures** (e.g., `user-123/documents/file.pdf`)
3. **Set appropriate metadata** for better file management
4. **Use content type validation** to prevent malicious uploads
5. **Implement file size limits** to prevent abuse
6. **Regular cleanup** of temporary files and unused buckets

## Monitoring and Logging

The storage service includes comprehensive logging:

- File upload/download operations
- Bucket creation and management
- Error conditions and failures
- Performance metrics

Access MinIO console at: `http://localhost:39001`
- Username: `minioadmin`
- Password: `minioadmin123`

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure MinIO container is running
2. **Access denied**: Check MinIO credentials and bucket policies
3. **Bucket not found**: Verify bucket exists or create it
4. **File not found**: Check file key and bucket name
5. **Network timeout**: Check MinIO endpoint and network connectivity

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

### Health Check

The storage service initialization includes connection testing and default bucket creation. Check the application logs for MinIO connection status.

## Migration and Backup

### Data Migration

To migrate existing files to MinIO:

1. Use the storage service to upload files programmatically
2. Maintain original file metadata and structure
3. Verify file integrity after migration

### Backup Strategy

1. **Regular snapshots** of MinIO data directory
2. **Cross-region replication** for production environments
3. **Automated backup scripts** for critical data
4. **Disaster recovery procedures** documentation

## Performance Optimization

### Upload Performance

- Use multipart uploads for large files
- Implement parallel uploads for multiple files
- Optimize buffer sizes for streaming

### Download Performance

- Use presigned URLs for direct client access
- Implement caching strategies for frequently accessed files
- Consider CDN integration for public files

### Storage Optimization

- Implement lifecycle policies for automatic cleanup
- Use compression for text-based files
- Monitor storage usage and costs
