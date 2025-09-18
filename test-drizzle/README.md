# {{name}}

A modern Express.js API built with TypeScript, featuring comprehensive middleware, validation, testing, and development tools.

## Features

- **TypeScript**: Full type safety with strict configuration
- **Express.js**: Fast, unopinionated web framework
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Testing**: Jest with Supertest for API testing
- **Development**: Hot reload with tsx, ESLint, and Prettier
- **Logging**: Structured logging with custom logger
- **Error Handling**: Centralized error handling middleware
- **Path Aliases**: Clean imports with TypeScript path mapping

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run type-check` - Check TypeScript types without building

## Project Structure

```
src/
├── config/           # Environment and app configuration
├── controllers/      # Request handlers and business logic
├── middleware/       # Express middleware functions
├── routes/          # API route definitions
├── services/        # Business logic and data access
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── __tests__/       # Test files and setup
└── index.ts         # Application entry point
```

## API Endpoints

### Health Check

- `GET /health` - Application health status

### Users API

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## Development

The application uses:

- **Hot Reload**: Changes are automatically reloaded in development
- **Path Aliases**: Import with `@/` prefix for clean imports
- **Strict TypeScript**: All strict compiler options enabled
- **ESLint + Prettier**: Code formatting and linting
- **Jest**: Unit and integration testing

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `src/__tests__/` and follow the naming convention `*.test.ts`.

## Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details
