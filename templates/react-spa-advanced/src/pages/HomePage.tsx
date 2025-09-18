import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { useCounterStore } from '../store/counterStore'

export function HomePage() {
    const { count, increment, decrement, reset } = useCounterStore()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to React SPA Advanced
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    A modern React single-page application with state management, routing,
                    testing, and animations. Built with TypeScript, Tailwind CSS, and the latest React patterns.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Counter Demo
                </h2>

                <div className="text-center space-y-6">
                    <motion.div
                        key={count}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="text-6xl font-bold text-blue-600"
                    >
                        {count}
                    </motion.div>

                    <div className="flex justify-center space-x-4">
                        <Button onClick={decrement} variant="outline">
                            Decrement
                        </Button>
                        <Button onClick={increment}>
                            Increment
                        </Button>
                    </div>

                    <Button onClick={reset} variant="secondary" size="sm">
                        Reset
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        State Management
                    </h3>
                    <p className="text-gray-600">
                        Powered by Zustand for simple and effective state management
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Data Fetching
                    </h3>
                    <p className="text-gray-600">
                        TanStack Query for server state management and caching
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Testing Ready
                    </h3>
                    <p className="text-gray-600">
                        Vitest and Testing Library for comprehensive testing
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}