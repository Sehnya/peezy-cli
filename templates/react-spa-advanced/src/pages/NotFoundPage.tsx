import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
        >
            <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <h1 className="text-9xl font-bold text-gray-300">404</h1>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-4"
            >
                <h2 className="text-2xl font-semibold text-gray-900">
                    Page Not Found
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    The page you're looking for doesn't exist. It might have been moved,
                    deleted, or you entered the wrong URL.
                </p>

                <div className="pt-4">
                    <Link to="/">
                        <Button>
                            Go Back Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    )
}