# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies for the entire workspace
RUN bun install --frozen-lockfile

# Copy API app files
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Build the application
WORKDIR /app/apps/api
RUN bun install
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS production

WORKDIR /app

# Install curl for health checks and create logs directory
RUN apk add --no-cache curl && \
    mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunjs -u 1001

# Copy built application and workspace files
COPY --from=builder --chown=bunjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=bunjs:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=bunjs:nodejs /app/package.json ./workspace-package.json
COPY --from=builder --chown=bunjs:nodejs /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Set proper permissions for logs directory
RUN chown -R bunjs:nodejs logs

# Switch to non-root user
USER bunjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]