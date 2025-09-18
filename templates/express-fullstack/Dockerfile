# Multi-stage build for Express + React Full-Stack App
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressapp

# Copy built application
COPY --from=builder --chown=expressapp:nodejs /app/dist ./dist
COPY --from=builder --chown=expressapp:nodejs /app/package*.json ./
COPY --from=deps --chown=expressapp:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER expressapp

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/server/index.js"]