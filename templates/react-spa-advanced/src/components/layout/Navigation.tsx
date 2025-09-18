import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
]

export function Navigation() {
    const location = useLocation()

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-gray-900">
                            React SPA Advanced
                        </Link>
                    </div>

                    <div className="flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`relative px-3 py-2 text-sm font-medium transition-colors ${location.pathname === item.href
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                                {location.pathname === item.href && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        layoutId="activeTab"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}