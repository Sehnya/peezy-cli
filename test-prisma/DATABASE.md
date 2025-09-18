# Database Configuration

This project has been configured with the following databases:


## POSTGRESQL

- **Name**: test_prisma_db
- **Host**: localhost
- **Port**: 5432
- **Connection URL**: `postgresql://postgres:postgres@localhost:5432/test_prisma_db`

### Environment Variables
- `DATABASE_URL`: postgresql://postgres:postgres@localhost:5432/test_prisma_db
- `POSTGRES_DB`: test_prisma_db
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: postgres
- `POSTGRES_HOST`: localhost
- `POSTGRES_PORT`: 5432


## REDIS

- **Name**: redis
- **Host**: localhost
- **Port**: 6379
- **Connection URL**: `redis://localhost:6379`

### Environment Variables
- `REDIS_URL`: redis://localhost:6379
- `REDIS_HOST`: localhost
- `REDIS_PORT`: 6379


## Getting Started

1. **Start the databases**:
   ```bash
   docker-compose up -d
   ```

2. **Check database health**:
   ```bash
   docker-compose ps
   ```

3. **View database logs**:
   ```bash
   docker-compose logs [service-name]
   ```

4. **Connect to database**:
   - PostgreSQL: `psql postgresql://postgres:postgres@localhost:5432/test_prisma_db`
   - Redis: `redis-cli -h localhost -p 6379`

## Database Management

### Migrations
- Add your migration files to `database/migrations/`
- Run migrations with your ORM/framework of choice

### Backups
- PostgreSQL: `pg_dump postgresql://postgres:postgres@localhost:5432/test_prisma_db > backup.sql`
- MySQL: `mysqldump -h host -u user -p database > backup.sql`

### Monitoring
- Use `docker-compose logs -f [service]` to monitor database logs
- Check health status with `docker-compose ps`

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Permission issues**: Ensure Docker has proper permissions
3. **Data persistence**: Database data is stored in Docker volumes

### Reset Database
```bash
docker-compose down -v  # This will delete all data!
docker-compose up -d
```
