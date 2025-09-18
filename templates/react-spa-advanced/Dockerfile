# Multi-stage build for React SPA
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

# Production image with nginx
FROM nginx:alpine AS runner

# Copy built application to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactapp -u 1001

# Change ownership of nginx directories
RUN chown -R reactapp:nodejs /var/cache/nginx && \
    chown -R reactapp:nodejs /var/log/nginx && \
    chown -R reactapp:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R reactapp:nodejs /var/run/nginx.pid

# Switch to non-root user
USER reactapp

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]