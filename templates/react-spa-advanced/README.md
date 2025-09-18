# React SPA Advanced

A modern, feature-rich React Single Page Application with advanced patterns, state management, and testing setup.

## 🚀 Features

- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **React Router** for client-side routing
- **Zustand** for state management
- **TanStack Query** for server state
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Vitest** for testing
- **ESLint** for code quality

## 📦 Tech Stack

### Core

- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool and dev server

### Routing & State

- React Router DOM - Client-side routing
- Zustand - Lightweight state management
- TanStack Query - Server state management

### Forms & Validation

- React Hook Form - Form handling
- Zod - Schema validation
- Hookform Resolvers - Form validation integration

### UI & Styling

- Tailwind CSS - Utility-first CSS
- Headless UI - Unstyled accessible components
- Heroicons - Beautiful SVG icons
- Framer Motion - Animation library
- React Hot Toast - Toast notifications

### Development & Testing

- Vitest - Unit testing framework
- Testing Library - React testing utilities
- ESLint - Code linting
- TypeScript - Static type checking

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.19.0 or higher
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

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
react-spa-advanced/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Basic UI components
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx     # Home page
│   │   ├── AboutPage.tsx    # About page
│   │   ├── ContactPage.tsx  # Contact page
│   │   └── NotFoundPage.tsx # 404 page
│   ├── store/               # State management
│   │   └── counterStore.ts  # Example Zustand store
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── .env.example           # Environment variables template
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Styling

This template uses **Tailwind CSS** for styling with:

- **Utility-first** approach
- **Responsive design** built-in
- **Dark mode** support ready
- **Custom components** with Headless UI
- **Consistent spacing** and typography

### Key Styling Features

- Pre-configured Tailwind with custom colors
- Responsive breakpoints
- Animation utilities with Framer Motion
- Icon system with Heroicons
- Toast notifications with React Hot Toast

## 🗂️ State Management

### Zustand Store

Simple, lightweight state management:

```typescript
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### TanStack Query

Server state management for API calls:

```typescript
import { useQuery } from "@tanstack/react-query";

function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });
}
```

## 📝 Forms & Validation

Using React Hook Form with Zod for type-safe forms:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  // Form implementation
}
```

## 🧪 Testing

### Test Setup

- **Vitest** for fast unit testing
- **Testing Library** for React component testing
- **jsdom** for DOM simulation
- **Coverage reports** included

### Running Tests

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test -- --watch
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react'
import { HomePage } from './HomePage'

test('renders home page', () => {
  render(<HomePage />)
  expect(screen.getByText('Welcome')).toBeInTheDocument()
})
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Set these environment variables in production:

- `VITE_API_URL` - Your API endpoint
- `VITE_APP_NAME` - Application name
- `VITE_NODE_ENV=production`

### Deployment Platforms

This app can be deployed to:

- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS S3 + CloudFront** - Scalable hosting
- **GitHub Pages** - Free static hosting

## 🔧 Customization

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed

### Adding New State

1. Create store in `src/store/`
2. Use Zustand patterns
3. Add TypeScript types

### Styling Customization

1. Update `tailwind.config.js`
2. Modify global styles in `index.css`
3. Create custom components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
