import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/">← Back to Home</Link>
                    </Button>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">About {{ name }}</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            This is a Next.js application scaffolded with Peezy CLI, featuring modern development tools and best practices.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">🚀 Features</h2>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                <li>• Next.js 14 with App Router</li>
                                <li>• TypeScript for type safety</li>
                                <li>• Tailwind CSS for styling</li>
                                <li>• ESLint & Prettier for code quality</li>
                                <li>• Jest for testing</li>
                                <li>• Optimized for performance</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">🛠️ Development</h2>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                <li>• Hot reload development server</li>
                                <li>• Automatic code formatting</li>
                                <li>• Type checking on build</li>
                                <li>• Component-based architecture</li>
                                <li>• SEO optimized</li>
                                <li>• Responsive design</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">📚 Getting Started</h2>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <pre className="text-sm overflow-x-auto">
                                <code>{`# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test`}</code>
                            </pre>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">🔗 Useful Links</h2>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="outline" asChild>
                                <Link href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                                    Next.js Docs
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
                                    Tailwind Docs
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="https://www.typescriptlang.org/docs" target="_blank" rel="noopener noreferrer">
                                    TypeScript Docs
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}