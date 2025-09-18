# Peezy CLI v0.1.5 Release Notes

## 🚀 Major Release: Advanced Database Integration with ORM Support

This release transforms Peezy CLI into a complete full-stack development platform with advanced database integration, ORM support, and production-ready volume management.

## 🎯 Key Features

### ✨ Prisma ORM Integration

- **Complete Prisma setup** with schema.prisma, migrations, and seed files
- **Type-safe database client** with automatic code generation
- **Migration system** with versioned database changes
- **Seeding capabilities** with sample data and relationships
- **Prisma Studio** integration for visual database management

### 🔥 Drizzle ORM Integration

- **Lightweight TypeScript ORM** with SQL-like syntax and excellent performance
- **Schema definitions** with relations and type inference
- **Programmatic migrations** with TypeScript-first approach
- **Type-safe queries** with compile-time validation
- **Drizzle Kit** integration for schema management and introspection

### 📦 Advanced Volume Management

- **Preconfigured volumes** - Ready-to-use bind mounts in ./volumes directory
- **Custom volumes** - Named Docker volumes for production deployments
- **Persistent storage** - Data survives container restarts and rebuilds
- **Backup strategies** - Complete documentation for data recovery
- **Development workflow** - Organized volume structure with .gitkeep files

## 📋 New CLI Options

### Enhanced Database Commands

```bash
# Configure Prisma ORM
peezy new express-typescript my-api --databases postgresql --orm prisma

# Configure Drizzle ORM
peezy new express-typescript my-api --databases postgresql --orm drizzle

# Configure both ORMs for comparison
peezy new express-typescript my-api --databases postgresql --orm both

# Preconfigured volumes for development
peezy new express-typescript my-api --databases postgresql --volumes preconfigured

# Custom volumes for production
peezy new express-typescript my-api --databases postgresql --volumes custom
```

### New CLI Flags

- `--orm <orm>` - Configure Prisma, Drizzle, or both ORMs
- `--volumes <type>` - Volume configuration (preconfigured|custom)

## 🏗️ Generated Project Structure

### Complete ORM Setup

```
my-api/
├── prisma/
│   ├── schema.prisma          # Prisma schema with User/Post models
│   ├── migrations/
│   │   └── 001_init/
│   │       └── migration.sql  # Initial database schema
│   └── seed.ts               # Sample data seeding
├── drizzle/
│   ├── migrations/           # Drizzle migration files
│   ├── migrate.ts           # Migration runner
│   └── seed.ts              # Drizzle seeding script
├── src/
│   ├── schema/
│   │   └── schema.ts        # Drizzle schema definitions
│   └── config/
│       └── database.ts      # Database connection setup
├── volumes/
│   ├── postgres/            # PostgreSQL persistent data
│   ├── redis/               # Redis persistent data
│   └── README.md            # Volume documentation
├── drizzle.config.ts        # Drizzle configuration
├── docker-compose.yml       # Enhanced with volume mounts
└── DATABASE.md              # Complete setup guide
```

### Enhanced Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "drizzle:generate": "drizzle-kit generate:pg",
    "drizzle:push": "drizzle-kit push:pg",
    "drizzle:migrate": "tsx drizzle/migrate.ts",
    "drizzle:seed": "tsx drizzle/seed.ts",
    "drizzle:studio": "drizzle-kit studio"
  }
}
```

## 🔧 Technical Improvements

### Database Configuration

- **Health checks** for all database containers with proper timeouts
- **Connection pooling** with configurable limits and retry logic
- **Environment variables** automatically populated with secure defaults
- **Initialization scripts** for database setup and extensions
- **Volume persistence** with proper backup and recovery procedures

### ORM Features

- **Schema generation** with example User/Post models and relationships
- **Migration systems** for both Prisma and Drizzle with version control
- **Seeding capabilities** with realistic sample data
- **Type safety** with full TypeScript integration
- **Development tools** with studio interfaces for both ORMs

### Volume Management

- **Bind mounts** for development with ./volumes directory structure
- **Named volumes** for production deployments
- **Data persistence** across container restarts and rebuilds
- **Backup documentation** with specific commands for each database
- **Security considerations** with .gitignore recommendations

## 🎯 Use Cases

### Full-Stack Development

```bash
# Create Next.js app with Prisma
peezy new nextjs-app-router my-fullstack --databases postgresql --orm prisma

# Start development environment
cd my-fullstack
docker-compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### API Development

```bash
# Create Express API with both ORMs
peezy new express-typescript my-api --databases postgresql,redis --orm both

# Database workflow
cd my-api
docker-compose up -d

# Prisma workflow
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio

# Drizzle workflow
npm run drizzle:generate
npm run drizzle:push
npm run drizzle:seed
npm run drizzle:studio
```

### Production Deployment

```bash
# Create production-ready app
peezy new express-typescript my-prod-api --databases postgresql --orm prisma --volumes custom

# Production deployment
cd my-prod-api
docker-compose -f docker-compose.yml up -d
```

## 🧪 Quality Assurance

### Testing

- **148+ tests passing** - Comprehensive test coverage maintained
- **ORM integration tests** - Validation of generated schemas and configurations
- **Volume management tests** - Directory creation and permission validation
- **Cross-platform testing** - macOS, Linux, Windows compatibility

### Performance

- **Fast scaffolding** - ORM setup adds minimal overhead (<200ms)
- **Efficient volume creation** - Optimized directory structure generation
- **Memory usage** - Minimal impact on CLI performance
- **Database startup** - Health checks ensure proper initialization

## 🔄 Migration Guide

### From v0.1.4 to v0.1.5

- **No breaking changes** - All existing functionality preserved
- **New ORM features** - Optional enhancements to existing templates
- **Volume management** - Automatic for new projects, manual for existing
- **Enhanced documentation** - Updated guides and examples

### Upgrading Existing Projects

```bash
# Update CLI
npm update -g peezy-cli

# Add ORM to existing project (manual process)
# 1. Add dependencies to package.json
# 2. Create prisma/ or drizzle/ directories
# 3. Copy schema files from new project
# 4. Update docker-compose.yml with volumes
```

## 📊 Impact

This release establishes Peezy CLI as the premier tool for:

- **Full-stack development** with complete database integration
- **Enterprise applications** requiring robust data persistence
- **Development teams** needing consistent database workflows
- **Educational projects** teaching modern ORM patterns
- **Rapid prototyping** with production-ready configurations

## 🚀 What's Next

### Planned Features (v0.1.6+)

- **Database migrations** - Advanced migration management across ORMs
- **Schema synchronization** - Keep Prisma and Drizzle schemas in sync
- **Multi-database support** - Connect to multiple databases simultaneously
- **Cloud integrations** - Direct deployment to Railway, Vercel, AWS
- **Advanced seeding** - Faker.js integration for realistic test data

## 🙏 Acknowledgments

Special thanks to the community for requesting advanced database features. This release addresses real-world needs for modern full-stack development with production-ready database configurations.

---

**Full Changelog**: https://github.com/Sehnya/peezy-cli/compare/v0.1.4...v0.1.5
**Download**: `npm install -g peezy-cli@0.1.5`
