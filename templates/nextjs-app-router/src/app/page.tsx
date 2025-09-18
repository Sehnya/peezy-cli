import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="space-y-6 max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {{ name }}
                        </span>
                    </h1>

                    <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                        A modern Next.js application built with App Router, TypeScript, and Tailwind CSS.
                        Get started by editing the files in the <code className="bg-gray-100 px-2 py-1 rounded">src/app</code> directory.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button asChild size="lg">
                            <Link href="/about">
                                Get Started
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                                Documentation
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                Next.js 14
                            </CardTitle>
                            <CardDescription>
                                Built with the latest Next.js App Router for optimal performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Server Components, Streaming, and built-in optimizations out of the box.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🎨</span>
                                Tailwind CSS
                            </CardTitle>
                            <CardDescription>
                                Utility-first CSS framework for rapid UI development
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Pre-configured with custom design system and responsive utilities.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🔷</span>
                                TypeScript
                            </CardTitle>
                            <CardDescription>
                                Type-safe development with excellent IDE support
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Catch errors early and improve code quality with static typing.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 text-sm text-gray-500">
                    <p>
                        Created with{' '}
                        <Link
                            href="https://github.com/Sehnya/peezy-cli"
                            className="font-medium underline underline-offset-4 hover:text-gray-700"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Peezy CLI
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}