# Peezy CLI Database Integration Guide

## Overview

Peezy CLI now automatically generates SQL database builds with Docker configurations and environment variables. This feature enhances project scaffolding by providing production-ready database setups.

## Features

### Automatic Database Configuration

- **PostgreSQL, MySQL, SQLite, MongoDB** support
- **Redis** for caching and sessions
- **Elasticsearch** for search functionality
- **Docker Compose** services with health checks
- **Environment variables** automatically populated
- **Database initialization scripts**
- **Connection pooling** and error handling

### Enhanced Templates

Templates that support database integration:

- `nextjs-app-router` - Full-stack Next.js with database
- `express-typescript` - Express API with database support
- `flask` - Python Flask with database integration
- `fastapi` - FastAPI with async database support
- `flask-bun-hybrid` - Full-stack with database

## Usage

### Basic Database Setup

```bash
# Create project with default database (PostgreSQL)
peezy new express-typescript my-api

# Specify custom databases
peezy new express-typescript my-api --databases postgresql,redis

# Include search functionality
peezy new express-typescript my-api --databases postgresql --redis --search
```

### Available Database Options

- `postgresql` - PostgreSQL 15 with Alpine Linux
- `mysql` - MySQL 8.0 with optimized configuration
- `sqlite` - SQLite for lightweight applications
- `mongodb` - MongoDB 6.0 with replica set support
- `redis` - Redis 7 for caching and sessions
- `elasticsearch` - Elasticsearch 8.8 for search

### Command Line Options

```bash
--databases <list>    # Comma-separated database types
--redis              # Include Redis for caching
--search             # Include Elasticsearch for search
```

## Generated Files

### Environment Configuration

```bash
# .env.example and .env files are automatically populated
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_db
POSTGRES_DB=myapp_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

ELASTICSEARCH_URL=http://localhost:9200
```

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Database Initialization Scripts

```sql
-- database/init/01-init-postgresql.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Example table structure
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Configuration Code

```typescript
// src/config/database.ts
import { Pool } from "pg";
import { createClient } from "redis";

export const createDatabasePool = (): Pool => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

export const createRedisClient = () => {
  return createClient({
    url: process.env.REDIS_URL,
  });
};
```

### Enhanced Health Checks

```typescript
// Health endpoint includes database status
GET /health
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "elasticsearch": "not_configured"
  },
  "responseTime": 45
}
```

## Database-Specific Features

### PostgreSQL

- **Extensions**: UUID, pgcrypto automatically enabled
- **Connection pooling** with configurable limits
- **SSL support** for production environments
- **Health checks** with pg_isready
- **Backup scripts** included in documentation

### MySQL

- **Character set**: UTF8MB4 for full Unicode support
- **InnoDB engine** with optimized settings
- **Connection pooling** with retry logic
- **Health checks** with mysqladmin ping
- **Replication support** ready configuration

### Redis

- **Persistence** with RDB and AOF
- **Memory optimization** settings
- **Cluster support** configuration ready
- **Health monitoring** with ping commands
- **Session storage** integration

### Elasticsearch

- **Single-node** development setup
- **Security disabled** for development
- **Memory limits** configured for containers
- **Index templates** and mappings support
- **Health monitoring** with cluster health API

## Development Workflow

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# View logs
docker-compose logs -f postgres
```

### Database Management

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/myapp_db

# Connect to Redis
redis-cli -h localhost -p 6379

# MongoDB shell
mongo mongodb://localhost:27017/myapp_db
```

### Health Monitoring

```bash
# Check all services
curl http://localhost:3000/health

# Detailed health information
curl http://localhost:3000/health/detailed
```

## Production Considerations

### Security

- **Change default passwords** in production
- **Use environment-specific** configuration
- **Enable SSL/TLS** for database connections
- **Implement proper** authentication and authorization
- **Regular security updates** for database images

### Performance

- **Connection pooling** configured appropriately
- **Database indexes** for query optimization
- **Redis caching** for frequently accessed data
- **Monitoring and alerting** for database performance
- **Backup and recovery** procedures

### Scaling

- **Read replicas** for PostgreSQL/MySQL
- **Redis clustering** for high availability
- **Elasticsearch clustering** for search scaling
- **Database sharding** strategies
- **Load balancing** for database connections

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Permission errors**: Check Docker daemon permissions
3. **Connection timeouts**: Verify network connectivity
4. **Memory issues**: Adjust container memory limits
5. **Data persistence**: Ensure volume mounts are correct

### Debug Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Execute commands in container
docker-compose exec postgres psql -U postgres -d myapp_db

# Reset all data (destructive)
docker-compose down -v
docker-compose up -d
```

### Health Check Failures

- **Database not ready**: Wait for initialization to complete
- **Network issues**: Check Docker network configuration
- **Resource limits**: Increase memory/CPU limits
- **Configuration errors**: Verify environment variables

## Migration from Existing Projects

### Adding Database Support

1. **Run Peezy CLI** with database options on existing project
2. **Merge generated files** with existing configuration
3. **Update application code** to use database connections
4. **Test database connectivity** and health checks
5. **Deploy with new** Docker Compose configuration

### Upgrading Database Versions

1. **Update Docker images** in docker-compose.yml
2. **Test compatibility** with application code
3. **Backup existing data** before upgrade
4. **Run migration scripts** if needed
5. **Monitor performance** after upgrade

## Best Practices

### Development

- **Use consistent** naming conventions
- **Version control** database schema changes
- **Seed data** for development environments
- **Regular backups** even in development
- **Monitor resource usage** during development

### Production

- **Environment separation** (dev/staging/prod)
- **Automated backups** with retention policies
- **Monitoring and alerting** for all database metrics
- **Security scanning** for vulnerabilities
- **Disaster recovery** procedures tested regularly

## Examples

### Full-Stack Application

```bash
# Create Next.js app with PostgreSQL and Redis
peezy new nextjs-app-router my-fullstack-app --databases postgresql --redis

# Start development environment
cd my-fullstack-app
docker-compose up -d
npm run dev
```

### Microservice API

```bash
# Create Express API with multiple databases
peezy new express-typescript my-microservice --databases postgresql,mongodb --redis --search

# Development workflow
cd my-microservice
docker-compose up -d
npm run dev
```

### Python Web Application

```bash
# Create Flask app with database
peezy new flask my-python-app --databases postgresql --redis

# Start services
cd my-python-app
docker-compose up -d
python app.py
```

This database integration makes Peezy CLI a complete solution for modern application development with production-ready database configurations.
