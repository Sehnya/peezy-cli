import { render, screen } from '@testing-library/react'
import HomePage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>
    }
})

describe('HomePage', () => {
    it('renders the welcome message', () => {
        render(<HomePage />)

        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Welcome to')
    })

    it('renders the get started button', () => {
        render(<HomePage />)

        const getStartedButton = screen.getByRole('link', { name: /get started/i })
        expect(getStartedButton).toBeInTheDocument()
        expect(getStartedButton).toHaveAttribute('href', '/about')
    })

    it('renders the documentation button', () => {
        render(<HomePage />)

        const docsButton = screen.getByRole('link', { name: /documentation/i })
        expect(docsButton).toBeInTheDocument()
        expect(docsButton).toHaveAttribute('href', 'https://nextjs.org/docs')
    })

    it('renders feature cards', () => {
        render(<HomePage />)

        expect(screen.getByText('Next.js 14')).toBeInTheDocument()
        expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('renders the Peezy CLI link', () => {
        render(<HomePage />)

        const peezyLink = screen.getByRole('link', { name: /peezy cli/i })
        expect(peezyLink).toBeInTheDocument()
        expect(peezyLink).toHaveAttribute('href', 'https://github.com/Sehnya/peezy-cli')
    })
})