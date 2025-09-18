# {{name}}

A modern Next.js application built with App Router, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 14** with App Router for optimal performance
- **TypeScript** for type-safe development
- **Tailwind CSS** with custom design system
- **ESLint & Prettier** for code quality
- **Jest** for testing
- **Responsive Design** with mobile-first approach
- **SEO Optimized** with proper meta tags

## 📋 Requirements

- Node.js 20.19.0 or higher
- npm, pnpm, yarn, or bun

## 🛠️ Getting Started

1. **Install dependencies:**

```bash
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

2. **Start the development server:**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
# or
bun dev
```

3. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                 # App Router pages and layouts
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── about/          # About page
├── components/         # Reusable components
│   └── ui/            # UI components
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## 🎨 Styling

This project uses Tailwind CSS with a custom design system. The configuration includes:

- Custom color palette with CSS variables
- Typography scale
- Responsive breakpoints
- Component utilities

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:

- **Netlify**: Use the `@netlify/plugin-nextjs` plugin
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Use the Node.js buildpack
- **AWS Amplify**: Connect your repository and deploy

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - Learn about TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Created with ❤️ using [Peezy CLI](https://github.com/Sehnya/peezy-cli)
