# Enhanced Educational Prompts Feature

## Overview

Peezy CLI now features enhanced educational prompts designed to help developers, especially those learning web development, understand their choices and get started with best practices.

## Key Improvements

### 🎓 Educational Context

- **Descriptive choices**: Each option includes helpful descriptions explaining what it does
- **Learning hints**: Contextual information about when to use each technology
- **Beginner-friendly language**: Technical concepts explained in accessible terms

### 🚀 Interactive Experience

- **Visual indicators**: Clear icons and formatting for better readability
- **Smart defaults**: Sensible defaults for beginners (PostgreSQL, Prisma, Bun)
- **Conditional prompts**: Only show relevant options based on previous choices
- **Spacebar selection**: Clear instructions for multi-select prompts

### 📚 Post-Creation Guidance

- **Learning resources**: Curated links to official documentation
- **Step-by-step workflow**: Clear instructions for getting started
- **Technology-specific tips**: Helpful hints for each package manager and framework
- **ORM comparison**: Educational content when both ORMs are selected

## Enhanced Prompt Examples

### Template Selection

```
Choose your project template:
⭐ express-typescript — Node.js API server with TypeScript
   Perfect for learning REST APIs and microservices
```

### Database Selection

```
Select databases for your project: (Use SPACEBAR to select/deselect, ENTER when done)
◉ PostgreSQL — Most popular open-source relational database
  Great for complex queries, ACID compliance, and scalability
◯ MySQL — Fast, reliable relational database
  Excellent for web applications and read-heavy workloads
```

### ORM Selection

```
Choose your ORM (Object-Relational Mapping):
ORMs help you work with databases using TypeScript/JavaScript

❯ Prisma — Type-safe database toolkit with visual studio
  Great for beginners - visual database browser included!

  Drizzle — Lightweight, SQL-like TypeScript ORM
  Preferred by performance-focused developers

  Both (Compare) — Install both ORMs to compare and learn
  Educational setup - try both and pick your favorite!
```

## Educational Next Steps

After project creation, users receive comprehensive guidance:

### 🎓 Learning Resources

- Framework-specific documentation links
- Database tutorials based on selections
- ORM-specific getting started guides

### 🚀 Development Workflow

- Step-by-step setup instructions
- Database initialization commands
- Development server startup

### 💡 Technology Tips

- Package manager specific hints
- Best practices for chosen stack
- Comparison guidance for multiple ORMs

## Example Output

```
🎓 Learning Resources & Next Steps:

   📚 Learn Express.js: https://expressjs.com/en/starter/hello-world.html
   🔧 TypeScript Handbook: https://www.typescriptlang.org/docs/
   🧪 Testing with Jest: Check out src/__tests__/ for examples

🗄️ Database Resources:
   📖 PostgreSQL Tutorial: https://www.postgresql.org/docs/current/tutorial.html

🔗 ORM Learning Resources:
   🔷 Prisma Docs: https://www.prisma.io/docs/getting-started
   🎯 Try: npm run db:studio (visual database browser)
   🟡 Drizzle Docs: https://orm.drizzle.team/docs/overview
   🎯 Try: npm run drizzle:studio (query builder interface)
   🤔 Compare both ORMs in your project to see which you prefer!

🚀 Development Workflow:
   1. cd my-project
   2. docker-compose up -d  # Start databases
   3. npm run db:generate   # Generate Prisma client
   4. npm run db:push       # Create database schema
   5. npm run db:seed       # Add sample data
   6. bun run dev           # Start development server

💡 Bun Tip: Use 'bun --watch' for auto-restart during development
```

## Technical Implementation

### New Files

- `src/utils/enhanced-prompts.ts` - Enhanced prompt configurations and educational content
- Educational choice definitions with descriptions and hints
- Post-creation guidance functions

### Enhanced Features

- **Conditional prompts**: Show database/ORM options only for relevant templates
- **Smart defaults**: PostgreSQL and Prisma selected by default for learning
- **Multi-select support**: Spacebar selection for databases with clear instructions
- **Configuration summary**: Review choices before project creation
- **Educational output**: Comprehensive learning resources and next steps

### Backward Compatibility

- All existing CLI flags and JSON mode still work
- Non-interactive mode bypasses enhanced prompts
- Existing functionality preserved

## Benefits for Different User Types

### 🎓 Learning Developers

- Clear explanations of technology choices
- Curated learning resources
- Step-by-step guidance
- Comparison opportunities (both ORMs)

### 🚀 Experienced Developers

- Quick selection with sensible defaults
- Can still use CLI flags to bypass prompts
- Enhanced but not overwhelming information

### 👥 Teams & Educators

- Consistent project setup with educational context
- Great for teaching modern web development
- Standardized workflows with learning opportunities

## Future Enhancements

- **Interactive tutorials**: Built-in guided tours of generated projects
- **Video resources**: Links to video tutorials for visual learners
- **Community examples**: Real-world project examples using each stack
- **Progress tracking**: Track learning progress across different technologies
