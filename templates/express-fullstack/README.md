# Express + React Full-Stack Application

A modern full-stack application built with Express.js backend and React frontend, featuring authentication, database integration, and modern development tools.

## 🚀 Features

- **Backend**: Express.js with TypeScript
- **Frontend**: React 18 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth with bcrypt
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Development**: Hot reload for both frontend and backend
- **Testing**: Vitest for unit testing
- **Type Safety**: Full TypeScript coverage

## 📦 Tech Stack

### Backend

- Express.js - Web framework
- TypeScript - Type safety
- Drizzle ORM - Database toolkit
- PostgreSQL - Database
- JWT - Authentication
- Helmet - Security headers
- CORS - Cross-origin requests
- Morgan - HTTP logging

### Frontend

- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- React Router - Client-side routing
- TanStack Query - Server state management
- Axios - HTTP client

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
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database:**

   ```bash
   # Generate database schema
   npm run db:generate

   # Run migrations
   npm run db:migrate
   ```

4. **Start development servers:**

   ```bash
   npm run dev
   ```

   This starts both the Express server (port 3001) and React dev server (port 5173).

## 📁 Project Structure

```
express-fullstack-app/
├── src/
│   ├── client/                 # React frontend
│   │   ├── components/         # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Client utilities
│   │   ├── pages/             # Page components
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # React entry point
│   │   └── index.html         # HTML template
│   └── server/                # Express backend
│       └── index.ts           # Server entry point
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── .env.example             # Environment variables template
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:server` - Start only the Express server
- `npm run dev:client` - Start only the React dev server
- `npm run build` - Build both frontend and backend for production
- `npm run build:server` - Build only the backend
- `npm run build:client` - Build only the frontend
- `npm run start` - Start the production server
- `npm run test` - Run tests with Vitest
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🗄️ Database

This template uses PostgreSQL with Drizzle ORM. The database configuration includes:

- User authentication tables
- Task management example
- Proper relationships and constraints
- Migration system

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

The application includes a complete authentication system:

- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes on both frontend and backend
- Automatic token refresh

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Responsive design** out of the box
- **Dark mode** support ready
- **Component-based** styling approach

## 🧪 Testing

- **Vitest** for unit and integration tests
- **Testing Library** for React component testing
- **Supertest** for API endpoint testing
- **Coverage reports** included

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks (Example)

- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set these in production:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret for JWT signing
- `NODE_ENV=production`
- `PORT` - Server port (default: 3001)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
