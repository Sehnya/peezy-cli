# Database Volumes

This directory contains persistent storage for database containers.

## Structure
- `postgres/` - PostgreSQL data files
- `mysql/` - MySQL data files  
- `mongodb/` - MongoDB data files
- `redis/` - Redis data files
- `elasticsearch/` - Elasticsearch data files

## Important Notes
- These directories are mounted as Docker volumes
- Data persists between container restarts
- Backup these directories for data recovery
- Add to .gitignore if containing sensitive data

## Backup Commands
```bash
# PostgreSQL
docker-compose exec postgres pg_dump -U postgres database_name > backup.sql

# MySQL  
docker-compose exec mysql mysqldump -u root -p database_name > backup.sql

# MongoDB
docker-compose exec mongodb mongodump --out /backup

# Redis
docker-compose exec redis redis-cli BGSAVE
```
