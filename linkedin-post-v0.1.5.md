# LinkedIn Post - Peezy CLI v0.1.5

🚀 **Just shipped Peezy CLI v0.1.5 - The biggest release yet!**

After months of development, I'm excited to announce that Peezy CLI now includes **complete database integration** with both Prisma and Drizzle ORM support. This transforms it from a simple scaffolding tool into a full-stack development platform.

## 🎯 What's New:

✨ **Prisma ORM Integration**

- Complete schema setup with migrations & seeding
- Type-safe database client with auto-generation
- Prisma Studio integration for visual DB management

🔥 **Drizzle ORM Integration**

- Lightweight TypeScript-first ORM
- SQL-like syntax with excellent performance
- Compile-time type validation

📦 **Advanced Volume Management**

- Persistent Docker volumes that survive rebuilds
- Organized ./volumes structure for development
- Production-ready configurations

## 💻 Getting Started:

```bash
# Install the latest version
npm install -g peezy-cli@0.1.5

# Create a full-stack app with database
peezy new express-typescript my-api --databases postgresql --orm prisma

# Start developing immediately
cd my-api
docker-compose up -d
npm run db:generate && npm run db:seed
npm run dev
```

## 🏗️ What You Get:

- **Complete project structure** with ORM configurations
- **Docker Compose** setup with PostgreSQL/Redis
- **Health check endpoints** with database connectivity
- **Migration systems** for both ORMs
- **Sample schemas** with User/Post relationships
- **Comprehensive documentation** and setup guides

## 📊 The Numbers:

- **148+ tests passing** - Rock-solid reliability
- **205 files** in the npm package
- **Zero network dependencies** - Everything embedded
- **Cross-platform** support (macOS, Linux, Windows)

This release addresses real developer pain points: setting up databases, configuring ORMs, and managing persistent storage. No more spending hours on boilerplate - just run one command and start building.

Perfect for:
🎯 Full-stack developers building modern web apps
🎯 Teams needing consistent database workflows  
🎯 Educators teaching ORM patterns
🎯 Anyone prototyping with production-ready configs

What database integration features would you like to see next? Drop your thoughts below! 👇

#WebDevelopment #TypeScript #Database #ORM #Prisma #Drizzle #Docker #OpenSource #CLI #FullStack

---

**Try it now:** `npm install -g peezy-cli@0.1.5`
**GitHub:** https://github.com/Sehnya/peezy-cli
