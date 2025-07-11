# CSmart API

A modern Node.js API built with Hono, TypeScript, and MongoDB using Mongoose ORM.

## Features

- 🚀 **Fast & Modern**: Built with Hono framework and Bun runtime
- 🔐 **Authentication**: JWT-based authentication with refresh tokens
- 👥 **RBAC**: Role-Based Access Control with Policy-Based Authorization
- 📊 **Database**: MongoDB with Mongoose ODM
- 🔍 **Validation**: Request validation with Zod
- 📝 **Logging**: Structured logging with Winston
- 🐳 **Docker**: Containerized with Docker and Docker Compose
- 🧪 **Testing**: Unit and integration tests with Vitest
- 📚 **Documentation**: OpenAPI/Swagger documentation

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Vitest
- **Logging**: Winston
- **Containerization**: Docker

## Prerequisites

- Bun >= 1.0.0
- MongoDB >= 7.0
- Node.js >= 18 (for compatibility)

## Installation

1. Install dependencies:

```bash
bun install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
# Database Configuration (MongoDB)
DATABASE_URL=mongodb://localhost:27017/csmart

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters-long
```

## Database Setup

### Using Docker (Recommended)

Start MongoDB with Docker Compose:

```bash
# Start MongoDB and other services
docker-compose -f docker-compose.dev.yml up -d mongodb

# Or start all services
docker-compose -f docker-compose.dev.yml up -d
```

### Manual MongoDB Setup

1. Install MongoDB locally
2. Start MongoDB service
3. Create database and user (optional)

### Database Migration

Run the migration scripts to set up initial data:

```bash
# Setup indexes and seed initial data
bun run migrate:mongodb

# Or run individual scripts
bun run migrate:indexes  # Setup database indexes
bun run migrate:seed     # Seed initial data
```

## Development

Start the development server:

```bash
bun run dev
```

The API will be available at http://localhost:3000

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage
- `bun run migrate:mongodb` - Run all MongoDB migrations
- `bun run migrate:seed` - Seed initial data
- `bun run migrate:indexes` - Setup database indexes
- `bun run migrate:test` - Test migration functionality

## API Documentation

Once the server is running, you can access:

- API Documentation: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

## Authentication

The API uses JWT-based authentication with refresh tokens:

1. **Login**: POST `/auth/login`
2. **Refresh Token**: POST `/auth/refresh`
3. **Logout**: POST `/auth/logout`

### Default Users

After running the seed script, you can use these default accounts:

- **Admin**: `admin@csmart.cloud` / `admin123`
- **Test User**: `test@csmart.com` / `test123`

## Database Schema

The application uses MongoDB with the following main collections:

- **users** - User accounts and authentication
- **profiles** - User profile information
- **roles** - System roles
- **policies** - Authorization policies
- **user_roles** - User-role assignments
- **role_policies** - Role-policy associations
- **activity_logs** - System activity logs
- **refresh_tokens** - JWT refresh tokens
- **policy_evaluation_cache** - Permission evaluation cache

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/csmart` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

## Testing

Run the test suite:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run with coverage
bun run test:coverage

# Test migration functionality
bun run migrate:test
```

## Production Deployment

### Using Docker

1. Build the production image:

```bash
docker build -t csmart-api .
```

2. Run with Docker Compose:

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:

```bash
bun run build
```

2. Start the production server:

```bash
bun run start
```

## Migration from Drizzle ORM

If you're migrating from a previous version that used Drizzle ORM with PostgreSQL:

1. Export your existing data from PostgreSQL
2. Update the `POSTGRESQL_URL` environment variable
3. Run the migration script:

```bash
MIGRATE_FROM_POSTGRESQL=true bun run migrate:mongodb
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
