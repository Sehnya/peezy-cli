# Next.js Full-Stack Application

A complete Next.js 14 application with authentication, database integration, and modern development tools.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication
- **Drizzle ORM** with PostgreSQL
- **Headless UI** components
- **Heroicons** for icons
- **ESLint** for code quality

## 📦 Tech Stack

### Framework

- Next.js 14 - React framework with App Router
- TypeScript - Static type checking
- React 18 - UI library

### Database & Auth

- PostgreSQL - Relational database
- Drizzle ORM - Type-safe database toolkit
- NextAuth.js - Authentication library
- Auth.js Drizzle Adapter - Database adapter

### UI & Styling

- Tailwind CSS - Utility-first CSS framework
- Headless UI - Unstyled accessible components
- Heroicons - Beautiful SVG icons
- Tailwind Forms - Form styling plugin

### Development

- ESLint - Code linting
- Next.js ESLint Config - Next.js specific rules
- Drizzle Kit - Database migrations

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.19.0 or higher
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up the database:**

   ```bash
   # Generate database schema
   npm run db:generate

   # Run migrations
   npm run db:migrate
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
nextjs-fullstack-app/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx       # Context providers
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   └── tasks/             # Task management components
│   └── lib/                   # Utilities and configurations
│       ├── db/                # Database schema and config
│       ├── auth.ts            # NextAuth configuration
│       └── db.ts              # Database connection
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── .env.example             # Environment variables template
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🗄️ Database

This template uses PostgreSQL with Drizzle ORM:

- Type-safe database queries
- Automatic migrations
- Database studio for management
- Optimized for Next.js App Router

### Database Commands

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio
npm run db:studio
```

## 🔐 Authentication

Built-in authentication system with NextAuth.js:

- Multiple authentication providers
- Database sessions
- Protected routes and API endpoints
- Type-safe session management

### Auth Configuration

Configure providers in `src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    // Add your providers here
  ],
};
```

## 🎨 Styling

### Tailwind CSS

- Utility-first CSS framework
- Responsive design built-in
- Dark mode support
- Custom color palette

### Components

- Headless UI for accessible components
- Heroicons for consistent iconography
- Tailwind Forms for beautiful form styling

## 📱 API Routes

Next.js App Router API routes in `src/app/api/`:

- RESTful API endpoints
- Type-safe request/response handling
- Authentication middleware
- Database integration

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms

This app can also be deployed to:

- Railway
- AWS
- Google Cloud
- DigitalOcean

### Environment Variables

Set these in production:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app's URL
- `NEXTAUTH_SECRET` - Random secret for JWT signing
- Provider-specific variables (Google, GitHub, etc.)

## 🧪 Testing

Add testing with your preferred framework:

```bash
# Jest + Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Playwright for E2E
npm install --save-dev @playwright/test
```

## 🔧 Customization

### Adding Authentication Providers

1. Install provider package
2. Configure in `src/lib/auth.ts`
3. Add environment variables
4. Update database schema if needed

### Database Schema Changes

1. Modify schema in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

### Styling Customization

1. Update `tailwind.config.js`
2. Modify global styles in `src/app/globals.css`
3. Create custom components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
