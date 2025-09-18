import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata: Metadata = {
    title: '{{name}}',
    description: 'A Next.js application built with App Router, TypeScript, and Tailwind CSS',
    keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    authors: [{ name: 'Your Name' }],
    creator: 'Peezy CLI',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://your-domain.com',
        title: '{{name}}',
        description: 'A Next.js application built with App Router, TypeScript, and Tailwind CSS',
        siteName: '{{name}}',
    },
    twitter: {
        card: 'summary_large_image',
        title: '{{name}}',
        description: 'A Next.js application built with App Router, TypeScript, and Tailwind CSS',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-background font-sans antialiased">
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">{children}</div>
                </div>
            </body>
        </html>
    )
}